(function () {
  'use strict';

  var client = null;

  function cfg() {
    return window.POLSKIFY_CONFIG || {};
  }

  function isConfigured() {
    var c = cfg();
    return !!(window.supabase && c.supabaseUrl && c.supabaseAnonKey);
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!client) {
      client = window.supabase.createClient(
        cfg().supabaseUrl,
        cfg().supabaseAnonKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );
    }
    return client;
  }

  async function ensureRows(user) {
    var sb = getClient();
    if (!sb || !user) return;

    var displayName = (user.email || 'gracz').split('@')[0];

    var profile = await sb
      .from('profiles')
      .upsert(
        { id: user.id, display_name: displayName },
        { onConflict: 'id', ignoreDuplicates: true }
      );

    if (profile.error) throw profile.error;

    var progress = await sb
      .from('progress')
      .upsert(
        { user_id: user.id },
        { onConflict: 'user_id', ignoreDuplicates: true }
      );

    if (progress.error) throw progress.error;
  }

  async function signUp(email, password) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');

    var res = await sb.auth.signUp({ email: email, password: password });
    if (res.error) throw res.error;

    // Przy włączonym potwierdzaniu e-maila session może być null.
    if (res.data.user && res.data.session) {
      await ensureRows(res.data.user);
    }
    return res.data;
  }

  async function signIn(email, password) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');

    var res = await sb.auth.signInWithPassword({ email: email, password: password });
    if (res.error) throw res.error;

    await ensureRows(res.data.user);
    return res.data;
  }

  async function signOut() {
    var sb = getClient();
    if (!sb) return;
    var res = await sb.auth.signOut();
    if (res.error) throw res.error;
  }

  async function getSession() {
    var sb = getClient();
    if (!sb) return null;
    var res = await sb.auth.getSession();
    if (res.error) throw res.error;
    return res.data.session || null;
  }

  async function loadUser(user) {
    var sb = getClient();
    if (!sb || !user) return null;

    await ensureRows(user);

    var profileRes = await sb
      .from('profiles')
      .select('id, display_name, is_admin')
      .eq('id', user.id)
      .single();

    if (profileRes.error) throw profileRes.error;

    var progressRes = await sb
      .from('progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (progressRes.error) throw progressRes.error;

    var p = progressRes.data || {};

    return {
      id: user.id,
      email: user.email || '',
      displayName: profileRes.data.display_name || (user.email || 'gracz').split('@')[0],
      isAdmin: !!profileRes.data.is_admin,
      passedRegions: p.passed_regions || {},
      xp: Number(p.xp || 0),
      stats: p.stats || { quizzes:0, perfect:0, passedQuizStreak:0 },
      streak: {
        count: Number(p.streak_count || 0),
        best: Number(p.streak_best || 0),
        lastDay: p.streak_last_day || '',
        activeDays: p.active_days || []
      },
      league: {
        weeklyXP: Number(p.weekly_xp || 0),
        week: p.week_key || '',
        league: p.league || 'bronze'
      }
    };
  }

  async function saveUser(account) {
    var sb = getClient();
    if (!sb || !account || !account.id) return;

    var profileRes = await sb
      .from('profiles')
      .update({ display_name: account.displayName || (account.email || 'gracz').split('@')[0] })
      .eq('id', account.id);

    if (profileRes.error) throw profileRes.error;

    var streak = account.streak || {};
    var league = account.league || {};

    // Pola chronione (xp, weekly_xp, league, passed_regions) są zmieniane
    // wyłącznie przez funkcje RPC w bazie.
    var progressPayload = {
      user_id: account.id,
      stats: account.stats || {},
      streak_count: Number(streak.count || 0),
      streak_best: Number(streak.best || 0),
      streak_last_day: streak.lastDay || null,
      active_days: Array.isArray(streak.activeDays) ? streak.activeDays : [],
      updated_at: new Date().toISOString()
    };

    var progressRes = await sb
      .from('progress')
      .upsert(progressPayload, { onConflict: 'user_id' });

    if (progressRes.error) throw progressRes.error;
  }


  async function awardQuizXP(regionCode, score, total) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');

    var res = await sb.rpc('award_quiz_xp', {
      p_region_code: regionCode,
      p_score: Number(score),
      p_total: Number(total)
    });

    if (res.error) throw res.error;
    return Array.isArray(res.data) ? res.data[0] : res.data;
  }

  async function adminSetProtected(values) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');

    var res = await sb.rpc('admin_set_own_progress', {
      p_xp: values && values.xp != null ? Number(values.xp) : null,
      p_weekly_xp: values && values.weeklyXP != null ? Number(values.weeklyXP) : null,
      p_passed_regions: values && values.passedRegions != null ? values.passedRegions : null
    });

    if (res.error) throw res.error;
    return Array.isArray(res.data) ? res.data[0] : res.data;
  }




  async function startSecureQuiz(code) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');
    var res = await sb.rpc('start_secure_quiz', { p_quiz_code: code });
    if (res.error) throw res.error;
    return res.data;
  }

  async function submitSecureAnswer(sessionId, questionIndex, answerIndex) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');
    var res = await sb.rpc('submit_secure_answer', {
      p_session_id: sessionId,
      p_question_index: Number(questionIndex),
      p_answer_index: Number(answerIndex)
    });
    if (res.error) throw res.error;
    return Array.isArray(res.data) ? res.data[0] : res.data;
  }

  async function finalizeSecureQuiz(sessionId) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');
    var res = await sb.rpc('finalize_secure_quiz', { p_session_id: sessionId });
    if (res.error) throw res.error;
    return Array.isArray(res.data) ? res.data[0] : res.data;
  }

  async function awardSpecialQuizXP(code, score, total) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');
    var res = await sb.rpc('award_special_quiz_xp', {
      p_quiz_code: code,
      p_score: Number(score),
      p_total: Number(total)
    });
    if (res.error) throw res.error;
    return Array.isArray(res.data) ? res.data[0] : res.data;
  }

  async function loadSeason() {
    var sb = getClient();
    if (!sb) return null;
    var res = await sb.rpc('get_current_season');
    if (res.error) throw res.error;
    return Array.isArray(res.data) ? res.data[0] : res.data;
  }

  async function adminListUsers() {
    var sb = getClient();
    if (!sb) return [];
    var res = await sb.rpc('admin_list_users');
    if (res.error) throw res.error;
    return res.data || [];
  }

  async function adminUserAction(userId, action, value) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');
    var res = await sb.rpc('admin_user_action', {
      p_user_id: userId,
      p_action: action,
      p_value: value == null ? null : String(value)
    });
    if (res.error) throw res.error;
    return res.data;
  }

  async function loadMeta() {
    var sb = getClient();
    if (!sb) return null;
    var session = await getSession();
    if (!session || !session.user) return null;

    var rpc = await sb.rpc('get_my_profile_meta');
    if (!rpc.error) {
      return Array.isArray(rpc.data) ? (rpc.data[0] || null) : (rpc.data || null);
    }

    var res = await sb.from('user_meta')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (res.error) throw res.error;
    return res.data || null;
  }

  async function saveMeta(meta) {
    var sb = getClient();
    if (!sb) return null;
    var session = await getSession();
    if (!session || !session.user) return null;

    meta = meta || {};
    var payload = {
      user_id: session.user.id,
      display_name: meta.display_name || null,
      avatar: meta.avatar || '🇵🇱',
      frame: meta.frame || 'basic',
      theme: meta.theme || 'dark',
      daily: meta.daily || {},
      lifetime: meta.lifetime || {},
      updated_at: new Date().toISOString()
    };

    var res = await sb.from('user_meta')
      .upsert(payload, { onConflict:'user_id' })
      .select()
      .single();

    if (res.error) throw res.error;
    return res.data;
  }



  async function adminSetMyCoins(value) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');
    var res = await sb.rpc('admin_set_my_coins', { p_coins:Number(value) });
    if (res.error) throw res.error;
    return Number(res.data || 0);
  }

  async function adminAddMyCoins(delta) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');
    var res = await sb.rpc('admin_add_my_coins', { p_delta:Number(delta) });
    if (res.error) throw res.error;
    return Number(res.data || 0);
  }

  async function getUnlockedTitles() {
    var sb = getClient();
    if (!sb) return [];
    var res = await sb.rpc('get_unlocked_profile_titles');
    if (res.error) throw res.error;
    return res.data || [];
  }

  async function setProfileTitle(titleId) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');
    var res = await sb.rpc('set_profile_title', { p_title: titleId });
    if (res.error) throw res.error;
    return Array.isArray(res.data) ? res.data[0] : res.data;
  }

  async function claimDailyReward() {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');
    var res = await sb.rpc('claim_daily_reward');
    if (res.error) throw res.error;
    return Array.isArray(res.data) ? res.data[0] : res.data;
  }

  async function buyShopItem(itemId, price) {
    var sb = getClient();
    if (!sb) throw new Error('Supabase nie jest skonfigurowany.');
    var res = await sb.rpc('buy_shop_item', {
      p_item_id:itemId,
      p_price:Number(price)
    });
    if (res.error) throw res.error;
    return Array.isArray(res.data) ? res.data[0] : res.data;
  }

  async function loadTop100(leagueId) {
    var sb = getClient();
    if (!sb) return [];
    var res = await sb.rpc('load_top100_with_titles', {
      p_league: leagueId && leagueId !== 'all' ? leagueId : null
    });
    if (res.error) throw res.error;
    return res.data || [];
  }

  async function loadLeaderboard(league, weekKey) {
    var sb = getClient();
    if (!sb) return [];

    var q = sb
      .from('league_entries')
      .select('user_id, display_name, weekly_xp, league, week_key')
      .eq('league', league)
      .order('weekly_xp', { ascending: false })
      .limit(50);

    if (weekKey) q = q.eq('week_key', weekKey);

    var res = await q;
    if (res.error) throw res.error;
    return res.data || [];
  }

  window.PolskifyBackend = {
    isConfigured: isConfigured,
    getClient: getClient,
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    getSession: getSession,
    loadUser: loadUser,
    saveUser: saveUser,
    awardQuizXP: awardQuizXP,
    startSecureQuiz: startSecureQuiz,
    submitSecureAnswer: submitSecureAnswer,
    finalizeSecureQuiz: finalizeSecureQuiz,
    awardSpecialQuizXP: awardSpecialQuizXP,
    loadSeason: loadSeason,
    adminListUsers: adminListUsers,
    adminUserAction: adminUserAction,
    adminSetProtected: adminSetProtected,
    loadMeta: loadMeta,
    saveMeta: saveMeta,
    adminSetMyCoins: adminSetMyCoins,
    adminAddMyCoins: adminAddMyCoins,
    getUnlockedTitles: getUnlockedTitles,
    setProfileTitle: setProfileTitle,
    claimDailyReward: claimDailyReward,
    buyShopItem: buyShopItem,
    loadTop100: loadTop100,
    loadLeaderboard: loadLeaderboard
  };
})();
