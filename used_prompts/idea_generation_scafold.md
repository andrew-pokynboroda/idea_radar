result https://github.com/andrew-pokynboroda/idea_radar/commit/85840f12549f6e31320eb3645597d7ec04bb0ddd

```markdown
add next js api route in /api/jobs/ideas/generate 

i will call it periodicaly from vercel cron scheduler

The idea is to generate ideas for new SaaS products on reddit based on painpoints. Start out of the themes. I have supabase table `themes`.  it has `name` and `keywords` (comma separated). Find subredits based on  keywords. 

Once subredits found go trough messages on subredit and identify paint point related to theme. 

if found painpoint run LLM prompt to find out potential idea for SaaS product or improve already existing idea.
- in context provide ideas that already present. fetche them from supabase based on theme_id

##write 2 prompt - use chain of though
###first for idea identification
it will receive message and ack straignt question 'Do we have any painpoint here that new SaaS might fix?'

### second to identify/improve idea
- it should deduct score. Based on how noval the idea is if there a solution or partial solution of the problem. How big is customer base, how hard is to Build MVP,how much money need to be invested
- define list of painpoint
- define list of insides and user observations
- provide narrow list of potential competitors

prompt should account your best knowlage about a theme. 


### If idea improved it should link another source to it 


### Tech implamentation
- provide auth based on versel cron token
- use js library https://github.com/jamiegood/reddit-client-api
- fetch subredits 1 month back
- use openrouter for prompt execution
- the final result should be ideas
- I have provided current table deffinition in screenshot
```