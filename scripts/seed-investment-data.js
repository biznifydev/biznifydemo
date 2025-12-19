const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedInvestmentData() {
  try {
    console.log('🌱 Seeding investment data...');

    // First, get the first organization
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);

    if (orgError || !organizations || organizations.length === 0) {
      console.error('❌ No organizations found. Please create an organization first.');
      return;
    }

    const organizationId = organizations[0].id;
    console.log(`📊 Using organization: ${organizationId}`);

    // 1. Create Investors
    console.log('👥 Creating investors...');
    const investors = [
      {
        organization_id: organizationId,
        name: 'Sequoia Capital',
        type: 'vc',
        email: 'partners@sequoia.com',
        website: 'https://sequoia.com',
        description: 'Leading venture capital firm',
        location: 'Menlo Park, CA',
        founded_year: 1972,
        aum: 85000000000,
        investment_focus: 'Technology, Healthcare, Consumer',
        contact_person: 'Michael Moritz',
        contact_email: 'mmoritz@sequoia.com',
        status: 'active'
      },
      {
        organization_id: organizationId,
        name: 'Andreessen Horowitz',
        type: 'vc',
        email: 'partners@a16z.com',
        website: 'https://a16z.com',
        description: 'Silicon Valley venture capital firm',
        location: 'Menlo Park, CA',
        founded_year: 2009,
        aum: 35000000000,
        investment_focus: 'Software, Crypto, Fintech',
        contact_person: 'Marc Andreessen',
        contact_email: 'marc@a16z.com',
        status: 'active'
      },
      {
        organization_id: organizationId,
        name: 'Accel Partners',
        type: 'vc',
        email: 'partners@accel.com',
        website: 'https://accel.com',
        description: 'Global venture capital firm',
        location: 'Palo Alto, CA',
        founded_year: 1983,
        aum: 12000000000,
        investment_focus: 'Enterprise, Consumer, Healthcare',
        contact_person: 'Jim Breyer',
        contact_email: 'jbreyer@accel.com',
        status: 'active'
      },
      {
        organization_id: organizationId,
        name: 'Angel Investor Network',
        type: 'angel',
        email: 'info@angelnetwork.com',
        description: 'Group of angel investors',
        location: 'San Francisco, CA',
        contact_person: 'Sarah Johnson',
        contact_email: 'sarah@angelnetwork.com',
        status: 'active'
      },
      {
        organization_id: organizationId,
        name: 'Strategic Partner Corp',
        type: 'strategic',
        email: 'partnerships@strategiccorp.com',
        website: 'https://strategiccorp.com',
        description: 'Strategic investment partner',
        location: 'New York, NY',
        contact_person: 'David Chen',
        contact_email: 'dchen@strategiccorp.com',
        status: 'active'
      }
    ];

    const { data: createdInvestors, error: investorError } = await supabase
      .from('investors')
      .insert(investors)
      .select();

    if (investorError) {
      console.error('❌ Error creating investors:', investorError);
      return;
    }

    console.log(`✅ Created ${createdInvestors.length} investors`);

    // 2. Create Investment Rounds
    console.log('💰 Creating investment rounds...');
    const investmentRounds = [
      {
        organization_id: organizationId,
        round_name: 'Seed Round',
        round_type: 'seed',
        date: '2023-01-15',
        amount_raised: 2000000,
        valuation: 8000000,
        lead_investor_id: createdInvestors[3].id, // Angel Investor Network
        status: 'closed',
        use_of_funds: 'Product development, team expansion, market validation',
        notes: 'Successful seed round with strong investor interest'
      },
      {
        organization_id: organizationId,
        round_name: 'Series A',
        round_type: 'series-a',
        date: '2023-08-20',
        amount_raised: 8000000,
        valuation: 40000000,
        lead_investor_id: createdInvestors[0].id, // Sequoia Capital
        status: 'closed',
        use_of_funds: 'Scaling operations, international expansion, R&D',
        notes: 'Series A led by Sequoia with participation from existing investors'
      },
      {
        organization_id: organizationId,
        round_name: 'Series B',
        round_type: 'series-b',
        date: '2024-03-10',
        amount_raised: 25000000,
        valuation: 150000000,
        lead_investor_id: createdInvestors[1].id, // Andreessen Horowitz
        status: 'active',
        use_of_funds: 'Market expansion, product development, strategic acquisitions',
        notes: 'Series B in progress with strong momentum'
      }
    ];

    const { data: createdRounds, error: roundError } = await supabase
      .from('investment_rounds')
      .insert(investmentRounds)
      .select();

    if (roundError) {
      console.error('❌ Error creating investment rounds:', roundError);
      return;
    }

    console.log(`✅ Created ${createdRounds.length} investment rounds`);

    // 3. Create Round Investors (Junction table)
    console.log('🤝 Creating round investors...');
    const roundInvestors = [
      // Seed Round Investors
      {
        round_id: createdRounds[0].id,
        investor_id: createdInvestors[3].id, // Angel Investor Network
        investment_amount: 1000000,
        ownership_percentage: 0.125,
        shares_issued: 125000,
        share_price: 8.00,
        investment_type: 'equity',
        board_seat: true,
        pro_rata_rights: true
      },
      {
        round_id: createdRounds[0].id,
        investor_id: createdInvestors[4].id, // Strategic Partner Corp
        investment_amount: 1000000,
        ownership_percentage: 0.125,
        shares_issued: 125000,
        share_price: 8.00,
        investment_type: 'equity',
        pro_rata_rights: true
      },
      // Series A Investors
      {
        round_id: createdRounds[1].id,
        investor_id: createdInvestors[0].id, // Sequoia Capital
        investment_amount: 5000000,
        ownership_percentage: 0.125,
        shares_issued: 125000,
        share_price: 40.00,
        investment_type: 'equity',
        board_seat: true,
        pro_rata_rights: true,
        anti_dilution: true
      },
      {
        round_id: createdRounds[1].id,
        investor_id: createdInvestors[3].id, // Angel Investor Network (follow-on)
        investment_amount: 2000000,
        ownership_percentage: 0.05,
        shares_issued: 50000,
        share_price: 40.00,
        investment_type: 'equity',
        pro_rata_rights: true
      },
      {
        round_id: createdRounds[1].id,
        investor_id: createdInvestors[2].id, // Accel Partners
        investment_amount: 1000000,
        ownership_percentage: 0.025,
        shares_issued: 25000,
        share_price: 40.00,
        investment_type: 'equity',
        pro_rata_rights: true
      },
      // Series B Investors
      {
        round_id: createdRounds[2].id,
        investor_id: createdInvestors[1].id, // Andreessen Horowitz
        investment_amount: 15000000,
        ownership_percentage: 0.10,
        shares_issued: 100000,
        share_price: 150.00,
        investment_type: 'equity',
        board_seat: true,
        pro_rata_rights: true,
        anti_dilution: true
      },
      {
        round_id: createdRounds[2].id,
        investor_id: createdInvestors[0].id, // Sequoia Capital (follow-on)
        investment_amount: 8000000,
        ownership_percentage: 0.053,
        shares_issued: 53333,
        share_price: 150.00,
        investment_type: 'equity',
        pro_rata_rights: true,
        anti_dilution: true
      },
      {
        round_id: createdRounds[2].id,
        investor_id: createdInvestors[4].id, // Strategic Partner Corp (follow-on)
        investment_amount: 2000000,
        ownership_percentage: 0.013,
        shares_issued: 13333,
        share_price: 150.00,
        investment_type: 'equity',
        pro_rata_rights: true
      }
    ];

    const { data: createdRoundInvestors, error: roundInvestorError } = await supabase
      .from('round_investors')
      .insert(roundInvestors)
      .select();

    if (roundInvestorError) {
      console.error('❌ Error creating round investors:', roundInvestorError);
      return;
    }

    console.log(`✅ Created ${createdRoundInvestors.length} round investor relationships`);

    // 4. Create Cap Table
    console.log('📊 Creating cap table...');
    const capTable = [
      {
        organization_id: organizationId,
        shareholder_name: 'Founder 1',
        shareholder_type: 'founder',
        shares_owned: 3000000,
        ownership_percentage: 0.60,
        share_class: 'common',
        share_price: 150.00,
        total_value: 450000000,
        vesting_schedule: '4-year vesting with 1-year cliff',
        vesting_start_date: '2023-01-01',
        vesting_end_date: '2027-01-01',
        fully_vested_date: '2027-01-01',
        last_updated: '2024-03-10'
      },
      {
        organization_id: organizationId,
        shareholder_name: 'Founder 2',
        shareholder_type: 'founder',
        shares_owned: 2000000,
        ownership_percentage: 0.40,
        share_class: 'common',
        share_price: 150.00,
        total_value: 300000000,
        vesting_schedule: '4-year vesting with 1-year cliff',
        vesting_start_date: '2023-01-01',
        vesting_end_date: '2027-01-01',
        fully_vested_date: '2027-01-01',
        last_updated: '2024-03-10'
      },
      {
        organization_id: organizationId,
        shareholder_name: 'Sequoia Capital',
        shareholder_type: 'investor',
        shares_owned: 178333,
        ownership_percentage: 0.0357,
        share_class: 'preferred-a',
        share_price: 150.00,
        total_value: 26749950,
        last_updated: '2024-03-10'
      },
      {
        organization_id: organizationId,
        shareholder_name: 'Andreessen Horowitz',
        shareholder_type: 'investor',
        shares_owned: 100000,
        ownership_percentage: 0.02,
        share_class: 'preferred-b',
        share_price: 150.00,
        total_value: 15000000,
        last_updated: '2024-03-10'
      },
      {
        organization_id: organizationId,
        shareholder_name: 'Angel Investor Network',
        shareholder_type: 'investor',
        shares_owned: 175000,
        ownership_percentage: 0.035,
        share_class: 'common',
        share_price: 150.00,
        total_value: 26250000,
        last_updated: '2024-03-10'
      },
      {
        organization_id: organizationId,
        shareholder_name: 'Strategic Partner Corp',
        shareholder_type: 'investor',
        shares_owned: 138333,
        ownership_percentage: 0.0277,
        share_class: 'common',
        share_price: 150.00,
        total_value: 20749950,
        last_updated: '2024-03-10'
      },
      {
        organization_id: organizationId,
        shareholder_name: 'Accel Partners',
        shareholder_type: 'investor',
        shares_owned: 25000,
        ownership_percentage: 0.005,
        share_class: 'preferred-a',
        share_price: 150.00,
        total_value: 3750000,
        last_updated: '2024-03-10'
      },
      {
        organization_id: organizationId,
        shareholder_name: 'Employee Stock Pool',
        shareholder_type: 'employee',
        shares_owned: 1000000,
        ownership_percentage: 0.20,
        share_class: 'common',
        share_price: 150.00,
        total_value: 150000000,
        vesting_schedule: '4-year vesting with 1-year cliff',
        vesting_start_date: '2023-01-01',
        last_updated: '2024-03-10'
      }
    ];

    const { data: createdCapTable, error: capTableError } = await supabase
      .from('cap_table')
      .insert(capTable)
      .select();

    if (capTableError) {
      console.error('❌ Error creating cap table:', capTableError);
      return;
    }

    console.log(`✅ Created ${createdCapTable.length} cap table entries`);

    // 5. Create Investment Milestones
    console.log('🎯 Creating investment milestones...');
    const milestones = [
      {
        organization_id: organizationId,
        milestone_name: 'Product Launch',
        description: 'Launch MVP to market',
        target_date: '2023-06-01',
        target_amount: 1000000,
        current_progress: 100,
        status: 'completed',
        key_metrics: ['User signups', 'Revenue growth', 'Customer feedback'],
        risks: ['Technical delays', 'Market competition'],
        dependencies: 'Development team, marketing budget'
      },
      {
        organization_id: organizationId,
        milestone_name: 'Series A Funding',
        description: 'Complete Series A round',
        target_date: '2023-08-01',
        target_amount: 8000000,
        current_progress: 100,
        status: 'completed',
        key_metrics: ['Funds raised', 'Investor commitments', 'Valuation'],
        risks: ['Market conditions', 'Investor interest'],
        dependencies: 'Financial model, pitch deck, investor meetings'
      },
      {
        organization_id: organizationId,
        milestone_name: 'International Expansion',
        description: 'Expand to European markets',
        target_date: '2024-06-01',
        target_amount: 5000000,
        current_progress: 60,
        status: 'in_progress',
        key_metrics: ['Market entry', 'Local partnerships', 'Revenue from new markets'],
        risks: ['Regulatory compliance', 'Cultural differences', 'Competition'],
        dependencies: 'Legal team, local partners, Series B funding'
      },
      {
        organization_id: organizationId,
        milestone_name: 'Series B Funding',
        description: 'Complete Series B round',
        target_date: '2024-03-01',
        target_amount: 25000000,
        current_progress: 80,
        status: 'in_progress',
        key_metrics: ['Funds raised', 'Investor commitments', 'Valuation'],
        risks: ['Market conditions', 'Investor interest', 'Due diligence'],
        dependencies: 'Financial performance, growth metrics, investor relationships'
      },
      {
        organization_id: organizationId,
        milestone_name: 'IPO Preparation',
        description: 'Begin IPO preparation process',
        target_date: '2025-01-01',
        target_amount: 100000000,
        current_progress: 10,
        status: 'planning',
        key_metrics: ['Revenue growth', 'Profitability', 'Market position'],
        risks: ['Market volatility', 'Regulatory requirements', 'Timing'],
        dependencies: 'Series C funding, profitability, market conditions'
      }
    ];

    const { data: createdMilestones, error: milestoneError } = await supabase
      .from('investment_milestones')
      .insert(milestones)
      .select();

    if (milestoneError) {
      console.error('❌ Error creating milestones:', milestoneError);
      return;
    }

    console.log(`✅ Created ${createdMilestones.length} investment milestones`);

    console.log('🎉 Investment data seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- ${createdInvestors.length} investors created`);
    console.log(`- ${createdRounds.length} investment rounds created`);
    console.log(`- ${createdRoundInvestors.length} round investor relationships created`);
    console.log(`- ${createdCapTable.length} cap table entries created`);
    console.log(`- ${createdMilestones.length} investment milestones created`);

  } catch (error) {
    console.error('❌ Error seeding investment data:', error);
  }
}

seedInvestmentData(); 