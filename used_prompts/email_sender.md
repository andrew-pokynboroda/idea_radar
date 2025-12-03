result: https://github.com/andrew-pokynboroda/idea_radar/commit/088592ebc7fdc1c112906d82138820a3c541dec3

```markdown
Add integration with resend for sending emails. It shold have its own orchestrator. 
- query ideas that was created today. Order by score
- find referenced subcription trough subscription_themes
- for each subscription send email with ideas. 
- build engaging email template for showing ideas. 
  - ideas must be ordered by score
  - ideas must be grouped by theme
  - try to show value for customer
  - call to action is to visit web app https://idea-radar-lyart.vercel.app/


Tech part
- isolate resend client so I can change email sender easily
- make sure there is no N+1 problem since we are querying with through model 
- make sure email template renders well on all email clients
- assume credential in .env

it should not be sent from separate route run it after ideas generation in 
```