/**
 * NāM Space — Centralized Financial Assumptions
 *
 * Fetches data from a published Google Sheet (CSV).
 * Falls back to hardcoded defaults if the sheet is unavailable.
 *
 * Usage in any deck:
 *   <script src="../../data/financials.js"></script>  (adjust path for depth)
 *   <script>
 *     NamFinancials.load().then(function(f) {
 *       console.log(f.rooms_phase1);        // 8
 *       console.log(f.opex_total);           // 242200
 *       console.log(f.accom_revenue(0.60));  // accommodation rev at 60% occ
 *       console.log(f.cw_revenue());         // co-working revenue
 *       console.log(f.gross_profit(0.60));   // total rev - opex
 *       console.log(f.investor_monthly(0.60, 1));  // per-investor monthly return (1 room)
 *     });
 *   </script>
 */

(function() {
  'use strict';

  // ══════════════════════════════════════
  // GOOGLE SHEET URL — Replace after publishing
  // File → Share → Publish to web → CSV → Copy link
  // ══════════════════════════════════════
  var SHEET_CSV_URL = '';  // Set this after creating the sheet

  // ══════════════════════════════════════
  // HARDCODED DEFAULTS (used as fallback)
  // ══════════════════════════════════════
  var DEFAULTS = {
    // Structure
    rooms_phase1: 8,
    rooms_phase2: 4,
    invest_per_room: 2340000,
    profit_share_pct: 40,
    max_rooms_per_investor: 4,
    term_years: 30,

    // Accommodation
    nightly_rate: 3000,
    weekly_rate: 18000,
    monthly_rate: 50000,
    blended_rate: 2250,
    mix_nightly: 30,
    mix_weekly: 20,
    mix_monthly: 50,

    // Scenarios
    occ_conservative: 50,
    occ_base: 60,
    occ_optimistic: 75,

    // Co-working
    cw_member_rate: 8000,
    cw_members_base: 20,
    cw_weekly_passes: 10,
    cw_weekly_rate: 3000,
    cw_day_passes: 10,
    cw_day_rate: 500,
    cw_offices: 2,
    cw_office_rate: 18000,

    // OPEX
    opex_staff: 102000,
    opex_land: 50000,
    opex_utilities: 25000,
    opex_maintenance: 15000,
    opex_repairs: 15000,
    opex_marketing: 12000,
    opex_insurance: 8000,
    opex_software: 8200,
    opex_misc: 7000,

    // Phase 2
    p2_blended_rate: 3500,
    p2_opex_add: 80000
  };

  // ══════════════════════════════════════
  // CSV PARSER
  // ══════════════════════════════════════
  function parseCSV(text) {
    var lines = text.trim().split('\n');
    var headers = lines[0].split(',');
    var data = {};
    for (var i = 1; i < lines.length; i++) {
      // Handle commas inside quotes
      var row = lines[i].match(/(".*?"|[^",]+)(?=,|$)/g);
      if (!row || row.length < 2) continue;
      var key = row[0].replace(/"/g, '').trim();
      var val = row[1].replace(/"/g, '').trim();
      var num = parseFloat(val);
      data[key] = isNaN(num) ? val : num;
    }
    return data;
  }

  // ══════════════════════════════════════
  // COMPUTED HELPERS
  // ══════════════════════════════════════
  function addHelpers(f) {
    // Total OPEX
    f.opex_total = f.opex_staff + f.opex_land + f.opex_utilities
      + f.opex_maintenance + f.opex_repairs + f.opex_marketing
      + f.opex_insurance + f.opex_software + f.opex_misc;

    // OPEX breakdown as array (for rendering)
    f.opex_items = [
      { key: 'opex_staff', label: 'Staff & payroll', desc: 'Community manager, cleaner, maintenance', value: f.opex_staff },
      { key: 'opex_land', label: 'Land rental', desc: '30-year lease, fixed rate', value: f.opex_land },
      { key: 'opex_utilities', label: 'Utilities', desc: 'Electricity, water, internet', value: f.opex_utilities },
      { key: 'opex_maintenance', label: 'Maintenance', desc: 'Grounds, pool, common areas', value: f.opex_maintenance },
      { key: 'opex_repairs', label: 'Repairs & replacements', desc: 'Furniture, appliances, wear & tear', value: f.opex_repairs },
      { key: 'opex_marketing', label: 'Marketing & acquisition', desc: 'Online listings, content, outreach', value: f.opex_marketing },
      { key: 'opex_insurance', label: 'Insurance', desc: 'Property, liability, contents', value: f.opex_insurance },
      { key: 'opex_software', label: 'Software & systems', desc: 'PMS, booking, accounting, WiFi', value: f.opex_software },
      { key: 'opex_misc', label: 'Miscellaneous', desc: 'Supplies, transport, contingency', value: f.opex_misc }
    ];

    // Total raise
    f.total_raise = f.invest_per_room * f.rooms_phase1;

    // Accommodation revenue at given occupancy (blended rate)
    f.accom_revenue = function(occ) {
      return f.rooms_phase1 * f.blended_rate * occ * 30;
    };

    // Co-working revenue
    f.cw_revenue = function(members) {
      members = members || f.cw_members_base;
      return (members * f.cw_member_rate)
        + (f.cw_weekly_passes * f.cw_weekly_rate)
        + (f.cw_day_passes * f.cw_day_rate)
        + (f.cw_offices * f.cw_office_rate);
    };

    // Total revenue
    f.total_revenue = function(occ, members) {
      return f.accom_revenue(occ) + f.cw_revenue(members);
    };

    // Gross profit
    f.gross_profit = function(occ, members) {
      return Math.max(0, f.total_revenue(occ, members) - f.opex_total);
    };

    // Investor pool
    f.investor_pool = function(occ, members) {
      return f.gross_profit(occ, members) * (f.profit_share_pct / 100);
    };

    // Per-room monthly return
    f.per_room_monthly = function(occ, members) {
      return f.investor_pool(occ, members) / f.rooms_phase1;
    };

    // Investor monthly return (n rooms)
    f.investor_monthly = function(occ, rooms, members) {
      return f.per_room_monthly(occ, members) * rooms;
    };

    // Annualized ROI for n rooms
    f.annualized_roi = function(occ, rooms, members) {
      var annual = f.investor_monthly(occ, rooms, members) * 12;
      var invested = f.invest_per_room * rooms;
      return invested > 0 ? (annual / invested * 100) : 0;
    };

    // Phase 2 calculations
    f.p2_total_rooms = f.rooms_phase1 + f.rooms_phase2;
    f.p2_total_opex = f.opex_total + f.p2_opex_add;

    f.p2_total_revenue = function(occ, members) {
      var p1_accom = f.rooms_phase1 * f.blended_rate * occ * 30;
      var p2_accom = f.rooms_phase2 * f.p2_blended_rate * occ * 30;
      return p1_accom + p2_accom + f.cw_revenue(members);
    };

    f.p2_gross_profit = function(occ, members) {
      return Math.max(0, f.p2_total_revenue(occ, members) - f.p2_total_opex);
    };

    f.p2_per_room_monthly = function(occ, members) {
      return (f.p2_gross_profit(occ, members) * (f.profit_share_pct / 100)) / f.p2_total_rooms;
    };

    return f;
  }

  // ══════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════
  var cached = null;

  window.NamFinancials = {
    load: function() {
      if (cached) return Promise.resolve(cached);

      if (!SHEET_CSV_URL) {
        // No sheet configured — use defaults
        cached = addHelpers(Object.assign({}, DEFAULTS));
        console.log('[NamFinancials] Using hardcoded defaults (no Google Sheet URL set)');
        return Promise.resolve(cached);
      }

      return fetch(SHEET_CSV_URL)
        .then(function(r) { return r.text(); })
        .then(function(csv) {
          var sheetData = parseCSV(csv);
          // Merge: sheet values override defaults
          var merged = Object.assign({}, DEFAULTS, sheetData);
          cached = addHelpers(merged);
          console.log('[NamFinancials] Loaded from Google Sheet');
          return cached;
        })
        .catch(function(err) {
          console.warn('[NamFinancials] Sheet fetch failed, using defaults:', err);
          cached = addHelpers(Object.assign({}, DEFAULTS));
          return cached;
        });
    },

    // Force reload (e.g., after sheet edit)
    reload: function() {
      cached = null;
      return this.load();
    },

    // Get cached data synchronously (only works after load)
    get: function() {
      return cached;
    }
  };
})();
