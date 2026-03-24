// Curated quotes from Lenny's Podcast transcripts
// Hand-picked from 300+ episodes for standalone insight density

const quotes = [
  {
    text: "40 to 60% of B2B purchase processes end in no decision. The majority couldn't figure out how to make a choice confidently — so they just delayed.",
    guest: "April Dunford",
    episode: "How to nail your product positioning"
  },
  {
    text: "It's so incredibly necessary to take what's implicit and make it explicit. If you don't make your intuition explicit, you don't get to find out when it's wrong.",
    guest: "Annie Duke",
    episode: "This will make you a better decision maker"
  },
  {
    text: "People generally think the purpose of a meeting is to discover, discuss, and decide. The only thing that's ever supposed to happen in a meeting is the discussion part.",
    guest: "Annie Duke",
    episode: "This will make you a better decision maker"
  },
  {
    text: "The context makes the irrational rational. The moment you hear a story and go 'I can't believe that' — nine times out of ten, it's because you don't have the rest of the story.",
    guest: "Bob Moesta",
    episode: "The ultimate guide to Jobs to Be Done"
  },
  {
    text: "Onboarding is the only part of your product that a hundred percent of people will ever touch. It's the first chance a customer has to be really excited — or really disappointed.",
    guest: "Adam Fishman",
    episode: "How to build a high-performing growth team"
  },
  {
    text: "I really enjoy being right — and it turns out in the working world, that did not serve me so great. It's more important to get to the outcome than to be right.",
    guest: "Ami Vora",
    episode: "Making an impact through authenticity and curiosity"
  },
  {
    text: "If everybody agrees with the decision, you didn't add any value — because they would've done that without you. The only value you ever add is when you make a decision most people don't like.",
    guest: "Ben Horowitz",
    episode: "Why founders fail and why you need to run toward fear"
  },
  {
    text: "The worst thing you do as a leader is hesitate on the next decision. The thing that causes you to hesitate is that both options are horrible — but one is always slightly better.",
    guest: "Ben Horowitz",
    episode: "Why founders fail and why you need to run toward fear"
  },
  {
    text: "People often think I get hired into later stage companies to teach them how to operate like a big company. In fact, I'm hired to remind them they can operate like a startup.",
    guest: "Claire Vo",
    episode: "Why AI is disrupting traditional product management"
  },
  {
    text: "I communicate to my leaders that my expectation is they bring the clock speed one click faster. If you think something needs to be done this year, it needs to be done this half.",
    guest: "Claire Vo",
    episode: "Why AI is disrupting traditional product management"
  },
  {
    text: "So much of the way we build products is a builder mindset — I have a plan, I manipulate things to match it. But it can't possibly create more value than the effort you put into it.",
    guest: "Alex Komoroske",
    episode: "Thinking like a gardener, slime mold, the adjacent possible"
  },
  {
    text: "Every movie starts with a shift in the world — from the old game to a new game. That structure is very different from 'hey, I'm going to solve your problem.'",
    guest: "Andy Raskin",
    episode: "The power of strategic narrative"
  },
  {
    text: "A pre-mortem isn't about pessimism. It's about asking: why can't we extract insights before things go wrong instead of waiting until after?",
    guest: "Shreyas Doshi",
    episode: "The art of product management"
  },
  {
    text: "Growth as a job is to connect users to the value of your product. Growth sometimes gets this reputation that it's just pure metrics hacking.",
    guest: "Albert Cheng",
    episode: "Finding hidden growth opportunities in your product"
  },
  {
    text: "User retention is gold for consumer subscription companies. If you don't retain your users, a lot of the onus is on getting them to pay on day one.",
    guest: "Albert Cheng",
    episode: "Finding hidden growth opportunities in your product"
  },
  {
    text: "You don't want to walk into the gym on day one and try to deadlift 300 pounds. When a first-time entrepreneur says 'I'm going to make the next great AI company' — that's the equivalent.",
    guest: "Andrew Wilkinson",
    episode: "I've run 75+ businesses. Here's why you're probably chasing the wrong idea."
  },
  {
    text: "The biggest mistakes I've made have been going into business models where other people have repeatedly failed and thinking I can do it better.",
    guest: "Andrew Wilkinson",
    episode: "I've run 75+ businesses. Here's why you're probably chasing the wrong idea."
  },
  {
    text: "Finding product-market fit is the single most important thing your startup does in the first three years. It's just underexplored and underexplained as a topic.",
    guest: "Todd Jackson",
    episode: "A framework for finding product-market fit"
  },
  {
    text: "How would you feel if you could no longer use this product? Once you got a high enough percentage saying they'd be very disappointed, most of those products did pretty well.",
    guest: "Sean Ellis",
    episode: "The original growth hacker reveals his secrets"
  },
  {
    text: "Ignore the people who say they'd be somewhat disappointed. They're telling you it's a nice-to-have. If you start optimizing for them, you'll dilute it for your must-have users.",
    guest: "Sean Ellis",
    episode: "The original growth hacker reveals his secrets"
  },
  {
    text: "I have never met this mythical beast called a great natural strategist. Great strategists have one thing in common — they just practice.",
    guest: "Roger Martin",
    episode: "5 essential questions to craft a winning strategy"
  },
  {
    text: "Focus is the fundamental source of power in strategy. Trying to do too many different things is defocusing. We work best when we concentrate on a few things.",
    guest: "Richard Rumelt",
    episode: "Good Strategy, Bad Strategy"
  },
  {
    text: "I'm a big fan of test everything. Any code change, any feature has to be in some experiment. Even small bug fixes can have surprising, unexpected impact.",
    guest: "Ronny Kohavi",
    episode: "The ultimate guide to A/B testing"
  },
  {
    text: "Most productivity metrics are a lie. If the goal is more lines of code, I can prompt something to write the longest piece of code ever. It's just too easy to game that system.",
    guest: "Nicole Forsgren",
    episode: "How to measure AI developer productivity in 2025"
  },
  {
    text: "Most teams can move faster. But faster for what? We can ship trash faster every single day. We need strategy and really smart decisions to know what to ship.",
    guest: "Nicole Forsgren",
    episode: "How to measure AI developer productivity in 2025"
  },
  {
    text: "To get to recommendation, you have to blow your user's socks off. You have to give them an experience they didn't know was previously possible.",
    guest: "Nilan Peiris",
    episode: "How to drive word of mouth"
  },
  {
    text: "AI very soon is going to stop being a feature the same way electricity is not a feature. What companies need to do is say: what's in this for the user?",
    guest: "Seth Godin",
    episode: "Seth Godin's best tactics for building remarkable products"
  },
  {
    text: "Tension is at the heart of every art form and every innovation. When you launch a product, the person imagines what their life might be like. Now there's tension — did you tell the truth?",
    guest: "Seth Godin",
    episode: "Seth Godin's best tactics for building remarkable products"
  },
  {
    text: "We're approaching a world where the marginal cost of good output approaches zero. The way you scale to exponential demand is with agents. The org chart starts to become the work chart.",
    guest: "Asha Sharma",
    episode: "How 80,000 companies build with AI"
  },
  {
    text: "These models are living organisms that just get better with more interactions. This is the new IP of every single company — products that think and live and learn.",
    guest: "Asha Sharma",
    episode: "How 80,000 companies build with AI"
  },
  {
    text: "In 2014 I told the press: 'I feel like what we have right now is just a giant piece of shit. It's terrible and we should be humiliated that we offer this to the public.' That was Slack.",
    guest: "Stewart Butterfield",
    episode: "Mental models for building products people love"
  },
  {
    text: "In the long run, the measure of our success will be the amount of value we create for customers. There's no substitute for actually having created it.",
    guest: "Stewart Butterfield",
    episode: "Mental models for building products people love"
  },
  {
    text: "Every new cohort of customers is different. You might nail onboarding for early users, then suddenly realize it's not as effective anymore. The answer is always: lots of opportunity.",
    guest: "Scott Belsky",
    episode: "Lessons on product sense, AI, the first mile experience"
  },
  {
    text: "I think we often treat engineers like children instead of giving them the responsibility and ability to actually thrive as adults.",
    guest: "Will Larson",
    episode: "The engineering mindset"
  },
  {
    text: "The blast radius of a poorly written memo is way bigger than most people think. If you had just taken another look at it, those 15 people would be off to the races.",
    guest: "Wes Kao",
    episode: "Persuasive communication and managing up"
  },
  {
    text: "If I'm not getting the reaction I'm looking for, how might I be contributing? How could I explain this more clearly? How can I anticipate questions they might have?",
    guest: "Wes Kao",
    episode: "Persuasive communication and managing up"
  },
  {
    text: "Fall in love with the problem — and then engage everyone else to fall in love with the same problem. That's the journey of leadership.",
    guest: "Uri Levine",
    episode: "A founder's guide to crisis management"
  },
  {
    text: "Every time you hire someone new, mark your calendar for 30 days and ask: knowing what I know today, would I hire this person? If the answer is no, fire them immediately.",
    guest: "Uri Levine",
    episode: "A founder's guide to crisis management"
  },
  {
    text: "We should be cannibalizing our existing product every six to twelve months. It should almost make the form factor of what we have today look dumb.",
    guest: "Varun Mohan",
    episode: "Building a magical AI code editor used by over 1M developers"
  },
  {
    text: "I want the company to be like a dehydrated entity. Every hire is like a little bit of water — we only go back and hire someone when we're dehydrated again.",
    guest: "Varun Mohan",
    episode: "Building a magical AI code editor used by over 1M developers"
  },
  {
    text: "Speaking is not a specialized skill, it's a meta skill. The better you get at speaking, the better your life gets.",
    guest: "Tristan de Montebello",
    episode: "Why most public speaking advice is wrong"
  },
  {
    text: "When you're looking for a job, you need a spear and not a net. The same is true when building a product — you need a narrow, clear focus.",
    guest: "Phyl Terry",
    episode: "Land your dream job in today's market"
  },
  {
    text: "LLMs can only be as good as the data they are given. You've got this synthesis machine, but if it hasn't got the data to work on top of, it's got nothing.",
    guest: "Shaun Clowes",
    episode: "Why great AI products are all about the data"
  },
  {
    text: "Why is product management still such a relatively undeveloped discipline? If we were doctors, you'd say that's totally unacceptable.",
    guest: "Shaun Clowes",
    episode: "Why great AI products are all about the data"
  },
  {
    text: "About 10% of the world's population uses ChatGPT every week. With scale comes responsibility. This model has taste.",
    guest: "Nick Turley",
    episode: "Inside ChatGPT: The fastest growing product in history"
  },
  {
    text: "Not every great thing is going to be invented by you. Refusing to adopt what works elsewhere means you're robbing your users of a better product.",
    guest: "Robby Stein",
    episode: "Inside Google's AI turnaround"
  },
  {
    text: "Are you proactively challenging your own assumptions? If there's no conflict, if there's no contention in a product review — something is missing.",
    guest: "Shweta Shriva",
    episode: "Product lessons from Waymo"
  },
  {
    text: "Sometimes your product actually doesn't matter. At Uber, the price and the ETA were the product. We humans consume the entirety of the product.",
    guest: "Peter Deng",
    episode: "Building products people love"
  },
  {
    text: "It's not a role, it's a career — being in product. There are so many things to learn and so many things to get good at.",
    guest: "Petra Wille",
    episode: "How to be the best coach to product people"
  },
  {
    text: "The company has a tendency to over-invest. Startups have the benefit of starving — so you need to create scarcity.",
    guest: "Tanguy Crusson",
    episode: "Hard-won lessons building 0 to 1 inside Atlassian"
  },
  {
    text: "If you're not prototyping and building to see what you want to build, you're doing it wrong. You need taste-making at the heart of it, otherwise you just have a Frankenstein product.",
    guest: "Aparna Chennapragada",
    episode: "Microsoft CPO: If you aren't prototyping with AI you're doing it wrong"
  },
  {
    text: "We had 10 to 15 customer meetings every day. As human beings, you have a bias to look for affirmation — versus a bias for what you don't want to hear.",
    guest: "Raaz Herzberg",
    episode: "Building Wiz: the fastest-growing startup in history"
  },
  {
    text: "The best word for a great product is that it's lovable. We should be striving for a minimum lovable product — not a minimum viable one.",
    guest: "Anton Osika",
    episode: "Building Lovable: $10M ARR in 60 days with 15 people"
  },
  {
    text: "Typically, you're bottlenecked where your ideas aren't fitting in because they need to be made quickly. Now you open that bottleneck — you become limited by how fast you can generate ideas.",
    guest: "Amjad Masad",
    episode: "Behind the product: Replit"
  },
  {
    text: "Studies have shown that bad prompts can get you down to 0% on a problem, and good prompts can boost you up to 90%. Prompt engineering is not dead.",
    guest: "Sander Schulhoff",
    episode: "AI prompt engineering in 2025: What works and what doesn't"
  },
  {
    text: "Almost everyone in a modern economy has hundreds of interactions with a phone or computer every day. We have an obligation as product people to put emotional energy back into people's lives.",
    guest: "Bob Baxley",
    episode: "35 years of product design wisdom from Apple, Disney, Pinterest"
  },
  {
    text: "It's a terrible outcome to wake up late in your career and feel trapped — going into a job you're not happy about. That's a trap we should all try to avoid.",
    guest: "Ada Chen Rekhi",
    episode: "Feeling stuck? Here's how to know when it's time to leave your job"
  },
  {
    text: "We lose an awful lot of deals to plain customer indecision — customers being more afraid of screwing up than missing out.",
    guest: "April Dunford",
    episode: "A step-by-step guide to crafting a sales pitch that wins"
  }
];

export default quotes;