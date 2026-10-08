# Jira Import Steps
1. Go to Jira -> Settings -> System -> External System Import.
2. Select CSV.
3. Import `epics.csv` first. Map 'Summary' to Summary, 'Issue Type' to Issue Type, 'Epic Name' to Epic Name, 'Priority' to Priority, 'Description' to Description.
4. Import `stories.csv`. Map 'Summary' to Summary, 'Issue Type' to Issue Type, 'Epic Link' to Epic Link, 'Priority' to Priority, 'Story Points' to Story Points, 'Description' to Description.
5. Go to your SOT board, move issues to the sprints and start them.
