(function(){
const TODAY = new Date(2026, 9, 8);
const S = { goal:null, takeHome:45000, amount:4500, salaryDay:1, autopay:true, showDaily:false, kept:false, consent:true };
const inr = n => '₹' + Math.round(n).toLocaleString('en-IN');
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const sipDay = () => S.salaryDay >= 28 ? 1 : S.salaryDay + 1;
function nextSip(){
  const d = sipDay();
  let m = TODAY.getMonth(), y = TODAY.getFullYear();
  if (d <= TODAY.getDate()) { m++; if (m > 11) { m = 0; y++; } }
  return d + ' ' + MONTHS[m];
}
const ord = d => d + (d%10==1&&d!=11?'st':d%10==2&&d!=12?'nd':d%10==3&&d!=13?'rd':'th');
function fv(p){ const r=.10/12, n=120; return p*((Math.pow(1+r,n)-1)/r)*(1+r); }
const lakh = v => '₹' + (v/1e5).toFixed(1) + ' lakh';
const GOALS = {
  grow:{t:'Grow my wealth', s:'5+ years', i:'i-grow', cat:'equity index'},
  emergency:{t:'Emergency fund', s:'use anytime', i:'i-umbrella', cat:'liquid'},
  big:{t:'Something big', s:'1 to 3 years', i:'i-gift', cat:'short-term debt'}
};
const FUND = {
  grow:{name:'Nifty 50 Index Fund', code:'N50', lines:["Buys India's 50 largest companies in one go","Costs about ₹1 a year for every ₹1,000 invested","Moves with the market; meant for 5+ years"], why:'We picked the lowest-cost Nifty 50 index fund available.'},
  emergency:{name:'Liquid Fund', code:'LIQ', lines:['Parks money in very short-term loans to banks and government','Take it out in 1 working day','Steady, small returns; very little up and down'], why:'We picked the lowest-cost liquid fund with the largest size.'},
  big:{name:'Short Duration Debt Fund', code:'SDF', lines:['Lends to government and top companies for 1 to 3 years','Calmer than stocks, usually ahead of a savings account','Best if you need the money in 1 to 3 years'], why:'We picked the lowest-cost short duration fund with high-rated loans.'}
};
const g = () => GOALS[S.goal || 'grow'];
const f = () => FUND[S.goal || 'grow'];

const SCREENS = [
  {id:'welcome', label:'Welcome'}, {id:'kyc', label:'KYC'}, {id:'goal', label:'Goal'}, {id:'amount', label:'Amount'},
  {id:'pick', label:'Pick'}, {id:'payday', label:'Payday'}, {id:'done', label:'SIP set'}, {id:'home', label:'Home'}, {id:'dip', label:'Dip'}
];
// after: [what changed, why, psychology]  before: [x%, y%, problem, psychology]
const NOTES = {
  welcome:{after:[['New subline: start with ₹500 a month','A small, safe first step replaces a product menu that leads with F&O.','Anchoring'],
                  ['Sign-in buttons unchanged','Nothing new to learn, so sign-up conversion has no reason to drop.','Familiarity'],
                  ['“Held in your name” above the legal line','Answers the trust question before she has to ask it.','Trust signal']],
           before:[[50,20,'The first promise is a product menu with F&O in it','Framing']]},
  kyc:{after:[['Progress bar: Step 2 of 3','She can see the finish line and what comes next.','Goal-gradient'],
              ['One line on why SEBI asks','A reason for a request raises how many people complete it.','Reason giving'],
              ['Continue leads into Groww Start','A ₹0-invested first-timer skips the Stocks Explore feed.','Default path']],
       before:[[50,16,'No sense of how many steps are left','Uncertainty'],[50,93,'Continue drops her on a live stock feed','Cold start']]},
  goal:{after:[['Three goals instead of 50 funds','One question about her life, mapped to a fund category for her.','Hick’s law'],
               ['“Most first-timers start here”','A gentle nudge for the unsure, without hype.','Social proof'],
               ['Skip, I’ll explore on my own','The full app is one tap away, so she never feels boxed in.','Autonomy']],
        before:[[74,27,'A ₹13.90 stock up 5.78% is trending','Herd / FOMO'],[11,68,'MTF, buying with borrowed money, is the first tool','Leverage risk'],[50,94,'F&O is a main tab','Wrong frame']]},
  amount:{after:[['Default of 10% of her pay','A reasoned first number beats an empty box.','Anchoring'],
                 ['Slider with a 10% tick','She can move either way, but the sensible point is marked.','Default effect'],
                 ['10-year projection','Makes a small monthly amount feel worth it.','Future self'],
                 ['Change or pause any time','The choice no longer feels permanent.','Loss aversion']],before:[]},
  pick:{after:[['One fund, not a ranked list','A single recommended option removes the fear of picking wrong.','Default effect'],
               ['Three plain-language lines','No NAV or expense ratio; she can explain it to a friend.','Processing fluency'],
               ['Why this fund','The rule is shown: lowest cost, not past returns.','Transparency'],
               ['See 2 other options','A short list keeps choice without the maze.','Autonomy']],before:[]},
  payday:{after:[['Tap salary day, SIP sets to the next day','Money moves the day after it arrives, before it is spent.','Implementation intention'],
                 ['UPI Autopay on by default','Doing nothing now means she keeps investing.','Status quo bias'],
                 ['Plain summary of the plan','One sentence she agrees to.','Commitment']],before:[]},
  done:{after:[['Next SIP date named','The habit is visible from day one.','Closure'],['First milestone','Progress starts immediately.','Endowed progress']],before:[]},
  home:{after:[['Goal ring instead of daily P&L','Something that grows every month replaces tiny daily swings.','Goal-gradient'],
               ['Daily change is off by default','Checking less often means fewer losses noticed.','Myopic loss aversion'],
               ['Milestones','The first is already ticked, so the next feels close.','Endowed progress'],
               ['“What happens when markets fall?”','Prepares her for the dip before it happens.','Inoculation']],
        before:[[50,16,'Red NIFTY and SENSEX strip on an empty home','Negativity bias'],[50,66,'“No stocks available” and no next step','Dead end'],[50,94,'F&O is a main tab','Wrong frame']]},
  dip:{after:[['“This is normal”','Names the fall and puts it in context first.','Normalising'],
              ['Chart marks where her SIP buys','The dip is shown as a cheaper price, not a loss.','Reframing'],
              ['About 1.6% more units','Turns the fall into a concrete gain for her.','Reframing'],
              ['Keep my SIP is the primary action','Staying is the easy path; selling is not promoted.','Default effect']],
       before:[[16,32,'Only red numbers, no context','Loss aversion'],[48,55,'A falling red chart fills the screen','Salience'],[74,91,'Chain opens the option chain at peak fear','Leverage risk']]}
};
let cur = 0;

const SPEC = {
  welcome:{short:'A promise she can say yes to', eye:'Before the flow', h:'Welcome: keep the sign-in, change the promise', tags:[['','Supports P0 choice paralysis'],['metric','Moves: sign-up to KYC start']],
    img:'/img/welcome.jpg', cap:'Today', today:['Subline lists Stocks, Mutual Funds, F&O','The first thing she reads is a product menu'], tv:'“F&O on the very first screen. Is this app for traders?”', av:'“₹500 a month I can do. Let’s see.”',
    why:['Framing','A low anchor of ₹500 makes starting feel safe. A product list with F&O frames Groww as a place to trade.'], watch:'The new subline shows only on a fresh install. Returning devices keep today’s line, so login success stays flat.'},
  kyc:{short:'Show the finish line', eye:'Before the flow', h:'KYC: keep the step, show the finish line', tags:[['','Regulatory step, kept as is'],['metric','Moves: KYC completion']],
    img:'/img/kyc-aadhaar.jpg', today:['No sense of how many steps are left','After KYC she lands on the Stocks Explore feed'], tv:'“Why do they need all this? How many more steps?”', av:'“Almost done, and then I actually start.”',
    why:['Goal-gradient effect','People speed up when the finish line is visible. Giving a reason for a request raises completion.'], watch:'The real change is routing: a ₹0-invested first-timer goes to Groww Start, not the market feed.'},
  goal:{short:'One question, not a market', eye:'Groww Start · step 1', h:'Goal: one question she can answer, instead of a market she can’t read', tags:[['p0','P0 · No 50-fund maze'],['metric','Start in 7 days: 35% → 50%']],
    img:'/img/stocks-explore.jpg', today:['Trending: a ₹13.90 stock up 5.78%','Products open with MTF (borrowed money)','F&O is one of three bottom tabs'], tv:'“A ₹14 stock is up 5%. Should I buy that? What is MTF?”', av:'“Easy. Grow my wealth.”',
    why:['Hick’s law and choice overload','Three goals replace 50 funds and a live market feed.'], hide:'Trending stocks, top movers, MTF and the F&O tab. All return through “Skip, I’ll explore on my own”.'},
  amount:{short:'A sensible default, not a blank box', eye:'Groww Start · step 2', h:'Amount: a sensible default instead of a blank box', tags:[['p1','P1 · No amount guessing'],['metric','Commit to a SIP: 40% → 60%']],
    none:'No screen today. She types into an empty box that shows only a minimum.', tv:'“Is ₹500 even worth it? Is ₹10,000 too much for me?”', av:'“10% of my pay. That’s a rule I can live with.”',
    why:['Anchoring and defaults','People stay close to the first number they see. “Change or pause any time” lowers loss aversion.'], watch:'Test 10% against 5% of pay. Track SIP amount alongside SIP starts.'},
  pick:{short:'One fund, explained', eye:'Groww Start · step 3', h:'One pick: one fund she understands, with the reason shown', tags:[['p0','P0 · No wrong-pick fear'],['metric','Start in 7 days']],
    none:'No screen today. She browses dozens of funds ranked by past returns, in jargon.', tv:'“50 funds… which one is right? What if I pick wrong?”', av:'“One fund, and I actually understand what it does.”',
    why:['Default effect, plain language','A single recommended option removes the fear of picking wrong.'], watch:'Compliance signs off on the copy. Funds are ranked by cost and the rule is shown, to avoid own-fund bias.'},
  payday:{short:'Invest the day after payday', eye:'Groww Start · step 4', h:'Payday SIP: invest the day after salary, automatically', tags:[['p1','P1 · No re-deciding'],['metric','Repeat to day 90']],
    none:'No screen today. A plain date picker, with Autopay as a separate step.', tv:'“I’ll start next month.”', av:'“It just happens after payday. I don’t have to remember.”',
    why:['Implementation intentions','A fixed “when this happens, do that” plan beats intention. Autopay makes doing nothing mean she keeps investing.'], watch:'Failed Autopay mandates and SIPs paused in month 2.'},
  done:{short:'The habit starts here', eye:'Groww Start · confirmation', h:'Her first SIP is set', tags:[['metric','About 5 taps from KYC, down from about 10']],
    none:'Today she gets an order confirmation with no next date and no link to a goal.', tv:'“Done… now what?”', av:'“Next one on the 2nd. I don’t have to do anything.”',
    why:['Closure','The confirmation names the next date, so the habit is visible from day one.'], watch:'Mandate approval rate at the bank step.'},
  home:{short:'Progress, not today’s market', eye:'Groww Start · step 5', h:'Goal home: progress toward her goal, not today’s market', tags:[['','P2 · No ₹3-gain letdown'],['metric','Repeat to day 90'],['','Guardrail: F&O flat']],
    img:'/img/holdings-empty.jpg', today:['Red NIFTY and SENSEX strip at the top','“No stocks available” on an empty box','F&O is a main tab'], tv:'“Nothing here, and everything is red.” Later: “Only +₹3? Why bother.”', av:'“9% of the way there already. Next SIP on the 2nd.”',
    why:['Myopic loss aversion','The more often people check returns, the more they sell. Goal progress grows every month.'], hide:'Index ticker strip, daily P&L (one toggle brings it back) and the F&O tab.'},
  dip:{short:'Make the dip feel normal', eye:'Groww Start · step 6', h:'Dip mode: explain the fall, show what her SIP gains', tags:[['p0','P0 · No panic selling'],['metric','Survive first dip: 70% → 85%']],
    img:'/img/nifty-red-day.jpg', today:['22,231.80, −371.25 (1.64%) in red','F&O tab selected; actions are Chart and Chain'], tv:'“I’m losing my money. Should I sell before it falls more?”', av:'“So a dip means I buy cheaper. I’ll keep it.”',
    why:['Loss aversion and reframing','The dip is framed as cheaper units, and “keep” is the default action.'], hide:'F&O tab and the Chain button on index pages. A moment of fear is the worst time to offer leverage.'}
};

const app = document.getElementById('app');
const beforeEl = document.getElementById('before');
const stepsEl = document.getElementById('steps');
const notesEl = document.getElementById('notes');
const thoughtEl = document.getElementById('thought');
const whenEl = document.getElementById('when');
// who gets routed into Groww Start when KYC succeeds; age and income never gate it
const PEOPLE = {
  ananya:{name:'Ananya, 23', result:'Sees Groww Start', checks:[
    ['New account','KYC done 2 min ago',true],['₹0 invested','No orders or SIPs',true],['F&O not activated','Not requested',true],
    ['No stock or F&O link','Ad: “Start with ₹500”',true],['Hasn’t skipped before','First visit',true]],
    defaults:'Age 23 (from PAN) and salaried, ₹5–10 lakh a year (from the KYC form) put her in the first rollout group and set her ₹45,000 take-home default.'},
  rahul:{name:'Rahul, 24', result:'Sees today’s app and lands on the F&O page he came for', checks:[
    ['New account','KYC done today',true],['₹0 invested','No orders yet',true],['F&O not activated','Asked for F&O at sign-up',false],
    ['No stock or F&O link','Opened an F&O ad',false],['Hasn’t skipped before','First visit',true]],
    defaults:'Same age group as Ananya, but his intent is trading, so age alone would have routed him wrongly.'},
  meera:{name:'Meera, 31', result:'Sees today’s app, unchanged. “Start a goal” is optional in Invest', checks:[
    ['New account','Opened in 2024',false],['₹0 invested','₹2.4 lakh in funds',false],['F&O not activated','Not requested',true],
    ['No stock or F&O link','Opened the app directly',true],['Hasn’t skipped before','Not applicable',true]],
    defaults:'An existing investor already has the habit, so nothing changes for her.'}
};
const TRIG = {
  welcome:()=>({when:'The first time the app opens on a phone that has never signed in.', how:[['Phone has never signed in','New install',true]], result:'New subline. Phones that signed in before keep today’s “Stocks · Mutual Funds · F&O”.'}),
  kyc:()=>({when:'Once, for every new account. When KYC succeeds, Groww runs five checks to decide what comes next.', route:true}),
  goal:()=>({when:'Straight after KYC, only if all five checks pass. Existing users can open it from Invest › Start a goal.', route:true}),
  amount:()=>({when:'After she picks a goal.', how:[['Goal',g().t,true],['Income range','₹5–10 lakh a year, KYC form',true]], result:'Take-home prefilled at ₹45,000, so the default is 10%. She can change both.'}),
  pick:()=>({when:'After she accepts an amount.', how:[['Goal',g().t,true],['Category for that goal',g().cat,true],['Cheapest fund in it','Ranked by cost, not returns',true]], result:`Shows ${f().name}.`}),
  payday:()=>({when:'After she taps Invest on her pick.', how:[['Salary day','She taps it once',true],['UPI Autopay','On unless she turns it off',true]], result:`SIP set for the ${ord(sipDay())}, the day after salary.`}),
  done:()=>({when:'When her bank approves the UPI Autopay mandate.', how:[['Autopay mandate','Approved by her bank',true]], result:`First SIP on ${nextSip()}.`}),
  home:()=>({when:'Her home screen for as long as she is in Groww Start.', how:[['In Groww Start','Account setting',true],['SIPs so far','2 of 3',true],['Days since KYC','60 of 90',true]], result:'After her 3rd SIP or day 90, Groww offers the full app. Hidden items return one at a time.'}),
  dip:()=>({when:'When the Nifty 50 falls 1.5% or more in a day, or her holdings are down. At most once a day.', how:[['Nifty 50 today','−1.6%, market data',true],['Running SIP',`${inr(S.amount)} on the ${ord(sipDay())}`,true],['Not shown yet today','First alert today',true],['In Groww Start','Traders never get it',true]], result:'Shows as a home card and one push notification.'})
};
const V = { mode:'after', cmp:false, psy:false, know:false, persona:'ananya' };
const toastEl = document.getElementById('toast');
let toastT;
function toast(msg){ toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(()=>toastEl.hidden = true, 2600); }

const ic = (id, s=22) => `<svg width="${s}" height="${s}" aria-hidden="true"><use href="#${id}"/></svg>`;
const navBar = (help=true) => `<div class="nav"><button class="icon-btn" data-act="back" aria-label="Back">${ic('i-back')}</button>${help?`<button class="icon-btn" aria-label="Help" data-act="help">${ic('i-help')}</button>`:''}</div>`;
const steps = (n) => `<div class="prog"><span class="t-cap">Groww Start · ${n} of 4</span><div class="prog-bar"><i style="width:${n*25}%"></i></div></div>`;

const R = {
welcome: () => `
  <div class="scroll" style="padding-top:28px;gap:16px">
    <div style="text-align:center;display:flex;flex-direction:column;gap:8px">
      <div class="t-xl" style="font-size:31px;color:#EAEBEF">Groww your wealth</div>
      <p data-note="1" class="t-sub" style="font-size:15.5px">Start with ₹500 a month.<br>We’ll set it up with you.</p>
    </div>
    <div class="welcome-art" role="img" aria-label="Groww city illustration, unchanged from today"></div>
  </div>
  <div class="foot">
    <button data-note="2" class="btn btn-light" data-go="kyc">${ic('i-google',20)}Continue with Google</button>
    <button class="btn btn-light" data-go="kyc">${ic('i-apple',20)}Continue with Apple</button>
    <button class="btn btn-light" data-go="kyc">${ic('i-mail',20)}Use another email</button>
    <button class="link" style="align-self:center;color:var(--ink);padding-top:6px">Trouble logging in?</button>
    <p data-note="3" class="legal">Your investments are held in your name.<br>By proceeding, I accept Groww’s <u>T&amp;C</u>, <u>Privacy Policy</u>, <u>Tariff Rates</u></p>
  </div>`,
kyc: () => `
  ${navBar()}
  <div class="scroll">
    <div class="prog"><span class="t-cap">Step 2 of 3 · Next: set up your first investment</span><div class="prog-bar"><i style="width:66%"></i></div></div>
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="t-lg">Verify Aadhaar using OTP</div>
      <p class="t-sub">Enter your Aadhaar and verify using OTP sent to your Aadhaar linked mobile number</p>
      <p data-note="2" class="note-line">${ic('i-info',16)}SEBI requires an identity check for every investor. It takes about 2 minutes.</p>
    </div>
    <div class="card" style="display:flex;flex-direction:column;gap:12px;align-items:center">
      <div class="aadhaar" style="width:100%"><div class="stripe"></div><div class="row"><div class="ph">${ic('i-user',40)}</div><div><div style="font-size:14px">Ananya Rao</div><div style="font-weight:700;font-size:18px;letter-spacing:.06em">XXXX XXXX XXXX</div></div></div></div>
      <button class="link">Don’t know your Aadhaar?</button>
    </div>
  </div>
  <div class="foot">
    <label class="consent"><input type="checkbox" id="consent" ${S.consent?'checked':''}><span>I hereby consent to provide my Aadhaar number, Aadhaar XML, Name, DOB, Address and photo for KYC.</span></label>
    <button data-note="3" class="btn btn-primary" data-go="goal" id="kyc-go" ${S.consent?'':'disabled'}>Continue</button>
  </div>`,
goal: () => `
  ${navBar()}
  <div class="scroll">
    ${steps(1)}
    <div style="display:flex;flex-direction:column;gap:6px">
      <div class="t-cap" style="color:var(--mint-ink);font-weight:600">Let’s set up your first investment · 2 questions, about a minute</div>
      <div class="t-xl">What are you investing for?</div>
    </div>
    <div data-note="1" role="radiogroup" aria-label="Goal" style="display:flex;flex-direction:column;gap:10px">
      ${Object.entries(GOALS).map(([k,v])=>`<button class="opt" role="radio" aria-checked="${S.goal===k}" data-goal="${k}"><span class="ic" style="color:var(--mint)">${ic(v.i)}</span><span><b>${v.t}</b><span>${v.s}</span></span><i class="radio"></i></button>`).join('')}
    </div>
    <div data-note="2" class="helper">${ic('i-info',18)}<span>Not sure? Most first-time investors start with <b style="color:var(--ink)">Grow my wealth</b>.</span></div>
  </div>
  <div class="foot">
    <button class="btn btn-primary" data-go="amount" ${S.goal?'':'disabled'}>Next</button>
    <button data-note="3" class="link" data-act="skip">Skip, I’ll explore on my own</button>
  </div>`,
amount: () => {
  const pct = Math.round(S.amount / S.takeHome * 100);
  const tenPct = Math.min(10000, Math.max(500, S.takeHome*.1));
  const tickPos = (tenPct-500)/(9500)*100;
  return `
  ${navBar()}
  <div class="scroll">
    ${steps(2)}
    <div class="t-xl">How much each month?</div>
    <div class="field"><label for="takehome">Your monthly take-home</label><input id="takehome" inputmode="numeric" value="${S.takeHome.toLocaleString('en-IN')}" aria-label="Monthly take-home in rupees"></div>
    <div data-note="1" style="display:flex;flex-direction:column;gap:4px;padding-top:6px">
      <div class="big" id="amt">${inr(S.amount)}</div>
      <p style="text-align:center;font-size:14px;font-weight:600;color:var(--mint)" id="pct">${pct}% of your pay</p>
    </div>
    <div data-note="2" class="slider">
      <span class="tick" style="left:${tickPos}%">▾ 10% of pay</span>
      <input type="range" id="range" min="500" max="10000" step="500" value="${S.amount}" aria-label="Monthly SIP amount">
      <div class="ends"><span>₹500</span><span>₹10,000</span></div>
    </div>
    <div data-note="3" class="card" style="display:flex;flex-direction:column;gap:6px">
      <p style="font-size:14.5px" id="proj">${inr(S.amount)} a month for 10 years could grow to about <b style="color:var(--mint)">${lakh(fv(S.amount))}</b> at 10% a year.</p>
      <p class="t-cap">Returns are not guaranteed.</p>
    </div>
    <p data-note="4" class="note-line">${ic('i-undo',16)}Change or pause any time, at no cost.</p>
  </div>
  <div class="foot"><button class="btn btn-primary" data-go="pick">Looks good</button></div>`;
},
pick: () => `
  ${navBar()}
  <div class="scroll">
    ${steps(3)}
    <div class="t-xl">Your pick for ${g().t}</div>
    <div data-note="1" class="card fund">
      <div class="fund-head"><span class="logo-tile">${f().code}</span><div style="flex:1;min-width:0"><div class="t-md">${f().name}</div><div class="t-cap">Direct · Growth · ${g().cat}</div></div><span class="chip mint">Low cost</span></div>
      <ul data-note="2" class="plain">${f().lines.map(l=>`<li><span style="color:var(--mint)">${ic('i-check',18)}</span>${l}</li>`).join('')}</ul>
      <details data-note="3" class="why"><summary>Why this fund ${ic('i-down',18)}</summary><p>${f().why} This is not personal advice.</p></details>
    </div>
    <div class="summary">You’ll invest <b>${inr(S.amount)}</b> every month.</div>
    <button data-note="4" class="link" style="align-self:center" data-act="alts">See 2 other options</button>
  </div>
  <div class="foot"><button class="btn btn-primary" data-go="payday">Invest</button></div>`,
payday: () => {
  const sd = sipDay();
  let cells = '';
  for (let d=1; d<=31; d++){
    const cls = d===S.salaryDay ? 'sal' : d===sd ? 'sip' : '';
    cells += `<button class="${cls}" data-day="${d}" aria-label="Salary on the ${ord(d)}" aria-pressed="${d===S.salaryDay}">${d}</button>`;
  }
  return `
  ${navBar()}
  <div class="scroll">
    ${steps(4)}
    <div class="t-xl">When does your salary come in?</div>
    <div data-note="1" class="card" style="display:flex;flex-direction:column;gap:12px">
      <div class="cal">${cells}</div>
      <div class="legend-row"><span><i style="background:var(--card-2);box-shadow:inset 0 0 0 1.5px var(--ink-2)"></i>Salary</span><span><i style="background:var(--mint)"></i>SIP date</span><span class="chip blue" style="margin-left:auto">Salary day +1</span></div>
    </div>
    <div data-note="2" class="card toggle-row">
      <div><div class="t-md">UPI Autopay</div><p class="t-cap">Your bank asks once, then it runs by itself.</p></div>
      <button class="switch" role="switch" aria-checked="${S.autopay}" data-act="autopay" aria-label="UPI Autopay"></button>
    </div>
    <div data-note="3" class="summary"><b>${inr(S.amount)}</b> into ${f().name} on the <b>${ord(sd)}</b> of every month.</div>
  </div>
  <div class="foot"><button class="btn btn-primary" data-go="done">Start SIP</button></div>`;
},
done: () => `
  <div class="done">
    <div class="tick-big" style="color:var(--mint)">${ic('i-check',44)}</div>
    <div class="t-xl">Your first SIP is set</div>
    <p data-note="1" class="t-sub">${inr(S.amount)} into ${f().name}.<br>Next one on <b style="color:var(--ink)">${nextSip()}</b>${S.autopay?', paid by Autopay':''}.</p>
    <span data-note="2" class="chip mint">Milestone unlocked · First SIP</span>
  </div>
  <div class="foot"><button class="btn btn-primary" data-go="home">Go to my goal</button></div>`,
home: () => {
  const inv = S.amount * 2, cv = Math.round(inv * 1.032), target = 100000;
  const pct = Math.min(100, Math.round(inv/target*100));
  const off = 326.7 * (1 - pct/100);
  return `
  <div class="app-head"><div class="who"><span class="avatar">A</span>Hi Ananya</div><span class="chip">Day 60 · simulated</span></div>
  <div class="scroll" style="padding-top:10px">
    ${S.kept?`<div class="helper" style="background:var(--mint-soft);color:var(--mint-ink)">${ic('i-check',18)}<span>SIP kept. Your next one buys at today’s lower price.</span></div>`:''}
    <div class="goal-card">
      <div style="display:flex;justify-content:space-between;align-items:center"><div class="t-md">${g().t}</div><span class="chip">${g().s}</span></div>
      <div class="ring-row">
        <div data-note="1" class="ring"><svg width="118" height="118" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" stroke="#1D2027" stroke-width="10" fill="none"/><circle cx="60" cy="60" r="52" stroke="#00D09C" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="326.7" stroke-dashoffset="${off}"/></svg><div class="c"><div><b>${pct}%</b><span>of first ₹1L</span></div></div></div>
        <div style="display:flex;flex-direction:column;gap:6px"><p style="font-size:14px;color:var(--ink-2)"><b style="color:var(--ink);font-size:17px">${inr(inv)}</b> invested so far</p><p class="t-cap">Next SIP: <b style="color:var(--ink)">${inr(S.amount)} on ${nextSip()}</b></p></div>
      </div>
      <div class="kv"><div><span>Invested</span><b>${inr(inv)}</b></div><div><span>Current value</span><b>${inr(cv)}</b></div></div>
      <div data-note="2" class="toggle-row"><span class="t-cap">Show daily change</span><button class="switch" role="switch" aria-checked="${S.showDaily}" data-act="daily" aria-label="Show daily change"></button></div>
      ${S.showDaily?`<p class="daily">Today: +₹3 (0.02%)</p>`:''}
    </div>
    <div style="display:flex;flex-direction:column;gap:10px"><div class="t-md">Milestones</div>
      <div data-note="3" class="miles">
        <div class="mile on"><span class="dot" style="color:var(--cta-ink)">${ic('i-check',16)}</span>First SIP</div>
        <div class="mile"><span class="dot"></span>3 in a row</div>
        <div class="mile"><span class="dot"></span>₹25,000 invested</div>
      </div>
    </div>
    <div data-note="4" class="card learn"><div><span class="chip blue">2 min</span><div class="t-md" style="padding-top:8px">What happens when markets fall?</div></div><div class="art" style="color:var(--blue-2)">${ic('i-learn',28)}</div></div>
    <button class="btn btn-ghost" data-act="sim-dip" style="font-size:14px">Simulate a 1.6% market fall →</button>
  </div>
  <div class="tabbar"><button aria-current="true">${ic('i-home')}Home</button><button data-act="tab">${ic('i-invest')}Invest</button><button data-act="tab">${ic('i-learn')}Learn</button></div>`;
},
dip: () => `
  <div class="app-head"><div class="who"><span class="avatar">A</span>Hi Ananya</div><span class="chip" style="color:var(--amber)">Market update</span></div>
  <div class="scroll" style="padding-top:10px">
    <div class="dip-card">
      <div data-note="1" class="t-lg">Markets fell 1.6% today. This is normal.</div>
      <p class="t-sub">Falls like this happen several times a year. Your plan is built for 5+ years.</p>
      <div data-note="2"><svg viewBox="0 0 300 120" width="100%" role="img" aria-label="Nifty 50 over the last month, falling 1.6% today, with your next SIP marked at today's lower price">
        <line x1="0" y1="40" x2="300" y2="40" stroke="#2A2D36" stroke-dasharray="4 4"/>
        <polyline fill="none" stroke="#F2A93B" stroke-width="2.2" stroke-linejoin="round" points="0,52 20,46 38,50 58,38 80,42 100,32 122,36 142,28 164,34 186,30 206,38 226,34 246,44 262,60 278,78 290,84"/>
        <circle cx="290" cy="84" r="6" fill="#00D09C"/>
        <text x="290" y="108" fill="#4FE3BD" font-size="11" text-anchor="end" font-family="Inter, sans-serif" font-weight="600">Your SIP buys here</text>
        <text x="0" y="30" fill="#7A7F8B" font-size="10.5" font-family="Inter, sans-serif">Last month’s level</text>
      </svg></div>
      <div data-note="3" class="summary" style="background:var(--mint-soft)">Your SIP on the <b style="color:var(--mint-ink)">${ord(sipDay())}</b> buys about <b style="color:var(--mint-ink)">1.6% more units</b> at today’s prices.</div>
      <p class="note-line" style="color:var(--ink)">${ic('i-check',16)}Your goal date: unchanged.</p>
    </div>
    <p class="t-cap" style="text-align:center">Shown at most once a day, when the Nifty 50 falls 1.5% or more.</p>
  </div>
  <div class="foot">
    <button data-note="4" class="btn btn-primary" data-act="keep">Keep my SIP</button>
    <button class="btn btn-ghost" data-act="pause">Pause next month</button>
  </div>
  <div class="tabbar"><button aria-current="true" data-go="home">${ic('i-home')}Home</button><button data-act="tab">${ic('i-invest')}Invest</button><button data-act="tab">${ic('i-learn')}Learn</button></div>`
};

const SBAR = document.querySelector('#screen .sbar').outerHTML;
const L = i => String.fromCharCode(65+i);
function renderSteps(){
  stepsEl.innerHTML = SCREENS.map((s,i)=>`<button data-idx="${i}" aria-current="${i===cur}">${s.label}</button>`).join('');
}
function layout(){
  document.getElementById('dev-before').hidden = !(V.cmp || V.mode==='before');
  document.getElementById('dev-after').hidden = !(V.cmp || V.mode==='after');
  document.getElementById('stage').classList.toggle('cmp', V.cmp);
  const seg = document.getElementById('seg'); seg.classList.toggle('off', V.cmp);
  seg.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed', b.dataset.mode===V.mode));
  document.getElementById('t-cmp').setAttribute('aria-pressed', V.cmp);
  document.getElementById('t-psy').setAttribute('aria-pressed', V.psy);
}
function pinLabel(k, psy){ return V.cmp && V.psy ? `${k} · ${psy}` : V.psy ? psy : k; }
function renderBefore(){
  const id = SCREENS[cur].id, sp = SPEC[id], nb = NOTES[id].before;
  const show = V.cmp || V.psy;
  beforeEl.innerHTML = sp.img
    ? `<img class="shot-full" src="${sp.img}" alt="Today's Groww screen for this step">` + (show ? nb.map((p,i)=>`<span class="pin bpin" data-k="b${i}" style="left:${p[0]}%;top:${p[1]}%;transform:translate(${p[0]<25?-12:p[0]>75?-88:-50}%,-50%)">${pinLabel(L(i), p[3])}</span>`).join('') : '')
    : SBAR + `<div class="empty-today"><svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true"><rect x="5" y="5" width="34" height="34" rx="9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 4"/></svg><b>No screen for this today</b><p>${sp.none.replace(/^No screen today\.\s*/,'')}</p></div>`;
}
function decorate(){
  app.querySelectorAll('.pin').forEach(p=>p.remove());
  if (!(V.cmp || V.psy)) return;
  const na = NOTES[SCREENS[cur].id].after;
  app.querySelectorAll('[data-note]').forEach(el=>{
    const n = +el.dataset.note, nt = na[n-1]; if (!nt) return;
    const s = document.createElement('span'); s.className = 'pin'; s.textContent = pinLabel(n, nt[2]); el.appendChild(s);
  });
}
function renderNotes(){
  notesEl.hidden = !V.cmp; if (!V.cmp) return;
  const id = SCREENS[cur].id, n = NOTES[id], sp = SPEC[id];
  const psy = t => V.psy ? `<span class="psy">${t}</span>` : '';
  notesEl.innerHTML =
    (n.before.length ? `<div><h4>Today</h4><ol>${n.before.map((p,i)=>`<li data-k="b${i}"><span class="k letter">${L(i)}</span><div><b>${p[2]}</b>${psy(p[3])}</div></li>`).join('')}</ol></div>` : '') +
    `<div><h4>What changed and why</h4><ol>${n.after.map((a,i)=>`<li data-k="a${i+1}"><span class="k">${i+1}</span><div><b>${a[0]}</b><p>${a[1]}</p>${psy(a[2])}</div></li>`).join('')}</ol></div>` +
    (sp.hide ? `<p class="hidden-for">Hidden for her: ${sp.hide}</p>` : '');
}
function highlight(k){
  document.querySelectorAll('.hl').forEach(e=>e.classList.remove('hl'));
  if (!k) return;
  notesEl.querySelector(`[data-k="${k}"]`)?.classList.add('hl');
  if (k[0]==='a') app.querySelector(`[data-note="${k.slice(1)}"]`)?.classList.add('hl');
  else beforeEl.querySelector(`[data-k="${k}"]`)?.classList.add('hl');
}
let typeTok = 0;
function typeVoice(){
  const sp = SPEC[SCREENS[cur].id];
  const lines = V.cmp ? [['Today', sp.tv], ['With Groww Start', sp.av]] : V.mode==='before' ? [['Today', sp.tv]] : [['With Groww Start', sp.av]];
  const tok = ++typeTok, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  thoughtEl.innerHTML = ''; let li = 0;
  (function next(){
    if (tok!==typeTok || li>=lines.length) return;
    const [lbl, txt] = lines[li++];
    thoughtEl.querySelectorAll('.line').forEach(l=>{ l.classList.add('past'); l.querySelector('.caret')?.remove(); });
    const p = document.createElement('p'); p.className = 'line';
    p.innerHTML = `<span class="lbl">${lbl}</span><span class="tx"></span><i class="caret"></i>`;
    thoughtEl.appendChild(p);
    const tx = p.querySelector('.tx');
    if (reduce){ tx.textContent = txt; next(); return; }
    let i = 0;
    (function step(){
      if (tok!==typeTok) return;
      tx.textContent = txt.slice(0, ++i);
      if (i < txt.length) setTimeout(step, /[.,?]/.test(txt[i-1]) ? 220 : 24 + Math.random()*34);
      else setTimeout(next, 700);
    })();
  })();
}
function renderWhen(){
  const t = TRIG[SCREENS[cur].id](), P = t.route ? PEOPLE[V.persona] : null;
  const checks = P ? P.checks : t.how, result = P ? P.result : t.result;
  whenEl.innerHTML = `<span class="lbl">When this shows</span><p class="s">${t.when}</p>
    <button class="know" aria-expanded="${V.know}" aria-controls="know-body">How does it know? ${ic('i-down',16)}</button>
    <div class="know-body" id="know-body" ${V.know?'':'hidden'}>
      ${P ? `<div class="seg sm" role="group" aria-label="Try as">${Object.entries(PEOPLE).map(([k,x])=>`<button data-p="${k}" aria-pressed="${k===V.persona}">${x.name}</button>`).join('')}</div>` : ''}
      <ul class="checks">${checks.map(c=>`<li class="${c[2]?'':'fail'}">${ic(c[2]?'i-check':'i-x',16)}<span>${c[0]}</span><span class="val">${c[1]}</span></li>`).join('')}</ul>
      <p class="result">→ ${result}</p>
      ${P ? `<p class="aside">${P.defaults}</p><p class="aside">Groww reads these from KYC (PAN, Aadhaar, the account form), the account itself and the link that brought the person in. Age and income never decide who sees it.</p>` : ''}
    </div>`;
}
whenEl.addEventListener('click', e=>{
  if (e.target.closest('.know')){ V.know = !V.know; renderWhen(); return; }
  const b = e.target.closest('[data-p]'); if (b){ V.persona = b.dataset.p; renderWhen(); }
});
function refresh(retype){ layout(); renderBefore(); decorate(); renderNotes(); renderWhen(); if (retype) typeVoice(); }
function go(i){
  cur = Math.max(0, Math.min(SCREENS.length-1, i));
  app.innerHTML = `<div class="scr">${R[SCREENS[cur].id]()}</div>`;
  bindScreen(); renderSteps(); refresh(true);
}
const goId = id => go(SCREENS.findIndex(s=>s.id===id));
function rerender(){ const st = app.querySelector('.scroll')?.scrollTop||0; app.innerHTML = `<div class="scr" style="animation:none">${R[SCREENS[cur].id]()}</div>`; const sc = app.querySelector('.scroll'); if (sc) sc.scrollTop = st; bindScreen(); decorate(); renderWhen(); }

function sheet(html){
  const scr = document.getElementById('screen');
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div class="scrim" data-close></div><div class="sheet" role="dialog" aria-modal="true" aria-label="Other options"><span class="grab"></span>${html}</div>`;
  wrap.id = 'sheetwrap';
  scr.appendChild(wrap);
  wrap.addEventListener('click', e=>{ if (e.target.closest('[data-close]')) wrap.remove(); });
}

function bindScreen(){
  const range = document.getElementById('range');
  if (range){
    const th = document.getElementById('takehome');
    const upd = () => {
      document.getElementById('amt').textContent = inr(S.amount);
      document.getElementById('pct').textContent = Math.round(S.amount/S.takeHome*100) + '% of your pay';
      document.getElementById('proj').innerHTML = `${inr(S.amount)} a month for 10 years could grow to about <b style="color:var(--mint)">${lakh(fv(S.amount))}</b> at 10% a year.`;
    };
    range.addEventListener('input', ()=>{ S.amount = +range.value; upd(); });
    th.addEventListener('change', ()=>{
      const v = parseInt(th.value.replace(/[^0-9]/g,''),10);
      if (v >= 5000){ S.takeHome = v; S.amount = Math.min(10000, Math.max(500, Math.round(v*.1/500)*500)); rerender(); }
      else { th.value = S.takeHome.toLocaleString('en-IN'); toast('Enter a monthly take-home of ₹5,000 or more.'); }
    });
  }
  const c = document.getElementById('consent');
  if (c) c.addEventListener('change', ()=>{ S.consent = c.checked; document.getElementById('kyc-go').disabled = !c.checked; });
}

document.getElementById('screen').addEventListener('click', e=>{
  const t = e.target.closest('button,[data-go]'); if (!t) return;
  if (t.dataset.go){ goId(t.dataset.go); return; }
  if (t.dataset.goal){ S.goal = t.dataset.goal; rerender(); return; }
  if (t.dataset.day){ S.salaryDay = +t.dataset.day; rerender(); return; }
  switch (t.dataset.act){
    case 'back': go(cur-1); break;
    case 'help': toast('Help opens a chat with Groww support.'); break;
    case 'skip': toast('Opens today’s Explore tab. Groww Start stays one tap away in Invest.'); break;
    case 'autopay': S.autopay = !S.autopay; rerender(); break;
    case 'daily': S.showDaily = !S.showDaily; rerender(); break;
    case 'tab': toast('Invest and Learn are out of scope for this prototype.'); break;
    case 'sim-dip': goId('dip'); break;
    case 'keep': S.kept = true; goId('home'); toast('SIP kept. Nothing else changes.'); break;
    case 'pause': toast(`Next month’s SIP is paused. It restarts on ${ord(sipDay())} of the month after.`); break;
    case 'alts': sheet(`<div class="t-lg">2 other options</div><p class="t-cap">Ranked by cost. Same goal, a little different.</p>
      <div class="alt"><div><b>Nifty Next 50 Index Fund</b>The next 50 large companies. More ups and downs.</div><button class="btn btn-ghost" style="padding:8px 12px;font-size:13px" data-close>Pick</button></div>
      <div class="alt"><div><b>Sensex Index Fund</b>India’s 30 largest companies. About ₹2 a year per ₹1,000.</div><button class="btn btn-ghost" style="padding:8px 12px;font-size:13px" data-close>Pick</button></div>
      <button class="btn btn-primary" data-close>Keep my pick</button>`); break;
  }
});
stepsEl.addEventListener('click', e=>{
  const b = e.target.closest('button'); if (!b) return;
  const to = +b.dataset.idx;
  if (S.goal===null && to > 2) S.goal = 'grow';
  go(to);
});
document.getElementById('seg').addEventListener('click', e=>{
  const b = e.target.closest('button'); if (!b || b.dataset.mode===V.mode) return;
  V.mode = b.dataset.mode; refresh(true);
});
document.getElementById('t-cmp').addEventListener('click', ()=>{ V.cmp = !V.cmp; refresh(true); });
document.getElementById('t-psy').addEventListener('click', ()=>{ V.psy = !V.psy; refresh(false); });
notesEl.addEventListener('mouseover', e=>{ const li = e.target.closest('li'); highlight(li ? li.dataset.k : null); });
notesEl.addEventListener('mouseleave', ()=>highlight(null));
document.addEventListener('keydown', e=>{
  if (document.getElementById('view-proto').hidden) return;
  if (e.target.matches('input')) return;
  if (e.key==='ArrowRight'){ if (S.goal===null && cur>=2) S.goal='grow'; go(cur+1); }
  if (e.key==='ArrowLeft') go(cur-1);
});

// tabs
const tabs = [['tab-proto','view-proto'],['tab-ds','view-ds']];
tabs.forEach(([tb,vw])=>document.getElementById(tb).addEventListener('click', ()=>{
  tabs.forEach(([b,v])=>{ const on = b===tb; document.getElementById(b).setAttribute('aria-selected', on); document.getElementById(v).hidden = !on; });
  try { localStorage.setItem('gs-tab', tb); } catch(_){}
}));
try { if (localStorage.getItem('gs-tab')==='tab-ds' || location.hash==='#design-system') document.getElementById('tab-ds').click(); } catch(_){}

// swatches
const SW = [
  ['App background','#0B0C10','Every screen'],['Card','#16181E','Cards, fields'],['Card raised','#1D2027','Tracks, inner tiles'],['Card line','#2A2D36','Borders, dividers'],
  ['Brand mint','#00D09C','Logo, progress, ring'],['CTA green','#00B386','Primary buttons, gains'],['Blue','#5367FF','Active tab, links, info'],['Blue light','#8E9AFF','Text on blue tint'],
  ['Loss red','#EB5B3C','Price falls only'],['Dip amber','#F2A93B','Dip card, new'],['Text','#F2F3F5','Primary text'],['Text 2','#B4B8C2','Secondary text'],['Light button','#F1F2F6','Sign-in buttons']
];
document.getElementById('swatches').innerHTML = SW.map(([n,h,u])=>`<div class="sw"><i style="background:${h};${h==='#0B0C10'?'box-shadow:inset 0 -1px 0 #22252E':''}"></i><div><b>${n}</b><code>${h}</code><br><span style="color:var(--ink-2)">${u}</span></div></div>`).join('');

// deep links such as #goal-compare-psy or #home-before
const tokens = (location.hash||'').slice(1).split('-');
if (tokens.includes('before')) V.mode = 'before';
if (tokens.includes('compare')) V.cmp = true;
if (tokens.includes('psy')) V.psy = true;
if (tokens.includes('know')) V.know = true;
['rahul','meera'].forEach(k=>{ if (tokens.includes(k)) V.persona = k; });
const start = SCREENS.findIndex(s=>s.id===tokens[0]);
if (start > 2) S.goal = 'grow';
go(Math.max(0, start));
})();
