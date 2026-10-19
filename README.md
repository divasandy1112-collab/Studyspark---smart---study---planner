StudySpark — Smart Study Planner

Overview

StudySpark is a beginner-built study planning web application designed to help students organize their academic tasks, understand which tasks need attention first, and track their study progress.

The application considers task deadlines, difficulty levels, and students' confidence levels to calculate task priorities and provide understandable explanations for its recommendations.

Key Features

- Task Management: Add and organize study tasks.
- Priority-Based Sorting: Arrange tasks according to calculated priority.
- Explainable Recommendations: Display explanations for why a task receives its priority.
- Deadline Awareness: Consider upcoming deadlines when prioritizing tasks.
- Difficulty and Confidence Factors: Use task difficulty and confidence inputs to help determine study priorities.
- Progress Tracking: Mark tasks as completed and view completion progress.
- Persistent Storage: Save tasks and completion status in the browser using local storage.
- Responsive Interface: Use the application on different screen sizes.

How the Priority System Works

StudySpark uses a transparent, rule-based scoring algorithm to prioritize incomplete study tasks. It does not currently use a trained machine-learning model.

Each active task receives a score based on three factors:

- Deadline urgency: Tasks that are overdue or due today receive 50 points. Tasks due in 1 day receive 45 points, within 2–3 days receive 35 points, within 4–7 days receive 25 points, within 8–14 days receive 15 points, and tasks due later receive 5 points.
- Task difficulty: Easy tasks receive 10 points, medium tasks receive 20 points, and hard tasks receive 30 points.
- Confidence level: Confidence ratings of 1–2 receive 20 points, a rating of 3 receives 12 points, and ratings of 4–5 receive 5 points.

The three values are added to produce the task's total priority score. Tasks are sorted from highest to lowest score, with deadline and task title used to break ties.

This approach makes the prioritization process understandable and predictable. Students can see the factors behind a recommendation rather than relying on an unexplained prediction.

The scores are heuristic rules chosen for this application; they are not learned from training data. Future versions could evaluate these rules with student feedback and explore data-driven recommendations.

Current Limitations

- The priority system is rule-based and does not learn from user behavior.
- Task recommendations depend on the information entered by the user and the programmed scoring rules.
- Task data is stored locally in the browser rather than in a cloud database.

Future Improvements

- Add a weekly study calendar.
- Introduce subject-wise progress summaries.
- Allow students to customize priority weights.
- Explore machine-learning-based recommendations after collecting suitable data and evaluating model performance.

Learning Goals

This project is an exploration of software development, decision-making systems, explainable recommendations, and the foundations of responsible AI design.

The goal is to build practical programming skills while creating a useful tool for students.

Project Status

Early-stage portfolio project. Features and documentation may evolve as development continues.

What I Learned

Building StudySpark gave me practical experience in planning, testing, and documenting a web application. Through this project, I explored:

- Problem-solving: Turning the challenge of organizing study tasks into a structured priority system.
- Algorithm design: Using deadlines, task difficulty, and confidence levels to calculate priority scores.
- Frontend development: Working with an interactive, responsive interface, task lists, progress indicators, and charts.
- State management and persistence: Learning how browser local storage preserves task data after a page refresh.
- Testing: Checking task creation, task completion, priority calculations, and overdue-task behaviour.
- Technical documentation: Explaining the project's purpose, features, algorithm, limitations, and future improvements.

This project has encouraged me to deepen my programming skills and explore software engineering and the foundations of artificial intelligence.
