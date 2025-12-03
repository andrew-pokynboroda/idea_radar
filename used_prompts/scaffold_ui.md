result: https://github.com/andrew-pokynboroda/idea_radar/commit/f3de5d192eca8b1887968241868ec47abff79266
```markdown
User uploaded image 1
Scalfold next.js project in current directory. 

This project will be designed for fiding new ideas for SaaS on reddit based on painpoints of people with AI.


## How it should work

Source Collection: The service periodically finds/receives a list of "popular subreddits" where people share problems.


Signal Extraction: Problem statements, pain triggers, frequency/engagement are extracted from fresh posts/comments.


Idea Generation: LLM forms short product ideas (name, Elevator pitch, target audience, the "pain" being solved).


Prospect Scoring: LLM (or a simple formula) gives a numerical or text scoring (e.g., pain, willingness to pay, competition, simplified TAM).


Results Delivery: The user sees a feed of fresh recommendations, can subscribe to e-mail notifications (with a thematic filter), and unsubscribe.


## Main features:
- Scoring of prospect ideas
- tematic notfications
- pitch generation


## Pages
for MVP I need 3 pages

- landing
- auth
- ideas - only visible for auth users

### Landing
- Design as on screenshot
- out of how it works and main features generate peatch that will be personal and address painpint of anterrenuer for ideation part of his work
- provide benefits section 
- generate relative infografics
- landing should have login button in top right and advertizing to `get satarted` action that leads to login

### Login page
- I use clerk for login
- use clerk component for login


### ideas page
- it should be paginated list of ideas sorted by highest score
- filter by new and theme
- add buttton subscribe that that will take themes and subscribe user on email notification for those themes



## Tech setup
- use shadcn ui and componets
- use clerk for auth
- supabase db
- use zustand store
- typescript


Final DB structure:


### Tables on supabase
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.idea_sources (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  source_type text NOT NULL,
  extracted_insight text NOT NULL,
  theme_id bigint NOT NULL,
  CONSTRAINT idea_sources_pkey PRIMARY KEY (id),
  CONSTRAINT idea_sources_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id)
);
CREATE TABLE public.ideas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  pitch text NOT NULL,
  key_pain_insight text NOT NULL,
  score integer NOT NULL,
  theme_id bigint NOT NULL,
  CONSTRAINT ideas_pkey PRIMARY KEY (id),
  CONSTRAINT ideas_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id)
);
CREATE TABLE public.subscription_themes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  subscription_id bigint NOT NULL,
  theme_id bigint NOT NULL,
  CONSTRAINT subscription_themes_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_themes_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id),
  CONSTRAINT subscription_themes_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id)
);
CREATE TABLE public.subscriptions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  owner_id text NOT NULL,
  email text NOT NULL,
  CONSTRAINT subscriptions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.themes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  keywordss text NOT NULL,
  CONSTRAINT themes_pkey PRIMARY KEY (id)
);


## Steps to execute
- scafold project
- create needed page
- figure out user auth / supabase auth (provide clerk token as owner_id)
- build landing page
-build auth page
- build ideas feed page

```