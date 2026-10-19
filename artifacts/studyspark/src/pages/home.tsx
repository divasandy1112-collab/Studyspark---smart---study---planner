import { type FormEvent, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Check, CheckCheck, GraduationCap, ListTodo, Plus, Sparkles, Target, Trash2, TrendingUp, X } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatDeadline, type Difficulty, type StudyTask, useStudyTasks } from '../lib/study-tasks';

const chartColors = ['#9b80ce', '#e7a4bf', '#79b8a6', '#e9bd72', '#82a9d2', '#be9acb'];
const today = new Date();
const todayLabel = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(today);
type FormValues = { subject: string; title: string; deadline: string; difficulty: Difficulty; confidence: string; estimatedMinutes: string };
const blankForm: FormValues = { subject: '', title: '', deadline: '', difficulty: 'medium', confidence: '3', estimatedMinutes: '30' };

function AddTaskDialog({ onClose, onAdd }: { onClose: () => void; onAdd: (task: Omit<StudyTask, 'id' | 'completed' | 'isSample'>) => void }) {
  const [values, setValues] = useState<FormValues>(blankForm);
  const [attempted, setAttempted] = useState(false);
  const titleError = !values.title.trim() ? 'Add a clear title for this study task.' : values.title.trim().length > 100 ? 'Keep the title under 100 characters.' : '';
  const subjectError = !values.subject.trim() ? 'Add a subject to keep your plan organized.' : '';
  const dateError = !values.deadline ? 'Choose a deadline.' : '';
  const minutes = Number(values.estimatedMinutes);
  const minutesError = !Number.isInteger(minutes) || minutes < 1 || minutes > 1440 ? 'Enter a time from 1 to 1,440 minutes.' : '';
  const invalid = !!(titleError || subjectError || dateError || minutesError);
  const update = (key: keyof FormValues, value: string) => setValues((current) => ({ ...current, [key]: value }));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAttempted(true);
    if (invalid) return;
    onAdd({ subject: values.subject.trim(), title: values.title.trim(), deadline: values.deadline, difficulty: values.difficulty, confidence: Number(values.confidence), estimatedMinutes: minutes });
    onClose();
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="add-task-heading">
      <div className="panel-heading"><div><div className="eyebrow">Make space for progress</div><h2 id="add-task-heading">Add a study task</h2><p className="modal-intro">A small next step is easier to start than a whole syllabus.</p></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={19}/></button></div>
      <form onSubmit={submit} noValidate>
        <div className="form-grid">
          <div className="field full"><label htmlFor="task-title">Task name</label><input id="task-title" data-testid="input-task-title" autoFocus maxLength={100} placeholder="e.g. Revise lecture 4 notes" value={values.title} onChange={(e) => update('title', e.target.value)} aria-invalid={attempted && !!titleError}/>{attempted && titleError && <span className="field-error">{titleError}</span>}</div>
          <div className="field"><label htmlFor="task-subject">Subject</label><input id="task-subject" data-testid="input-task-subject" maxLength={40} placeholder="e.g. Chemistry" value={values.subject} onChange={(e) => update('subject', e.target.value)} aria-invalid={attempted && !!subjectError}/>{attempted && subjectError && <span className="field-error">{subjectError}</span>}</div>
          <div className="field"><label htmlFor="task-deadline">Deadline</label><input id="task-deadline" data-testid="input-task-deadline" type="date" value={values.deadline} onChange={(e) => update('deadline', e.target.value)} aria-invalid={attempted && !!dateError}/>{attempted && dateError && <span className="field-error">{dateError}</span>}</div>
          <div className="field"><label htmlFor="task-difficulty">Difficulty</label><select id="task-difficulty" data-testid="select-task-difficulty" value={values.difficulty} onChange={(e) => update('difficulty', e.target.value)}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></div>
          <div className="field"><label htmlFor="task-minutes">Estimated study time</label><input id="task-minutes" data-testid="input-task-minutes" type="number" min="1" max="1440" step="1" value={values.estimatedMinutes} onChange={(e) => update('estimatedMinutes', e.target.value)} aria-invalid={attempted && !!minutesError}/>{attempted && minutesError && <span className="field-error">{minutesError}</span>}</div>
          <div className="field full"><label htmlFor="task-confidence">How confident do you feel?</label><div className="range-wrap"><input id="task-confidence" data-testid="input-task-confidence" aria-label="Confidence, 1 means need a lot of help and 5 means feel confident" type="range" min="1" max="5" step="1" value={values.confidence} onChange={(e) => update('confidence', e.target.value)} /><span className="range-value">{values.confidence} / 5</span></div></div>
        </div>
        <p className="score-explainer">Your deadline, difficulty, and confidence determine a visible score. Every point is explained in your plan.</p>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" data-testid="button-save-task" className="primary-button">Add to my plan <Plus size={15}/></button></div>
      </form>
    </section>
  </div>;
}

export default function Home() {
  const { tasks, activeTasks, addTask, toggleTask, removeTask } = useStudyTasks();
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState('');
  const completed = tasks.filter((task) => task.completed).length;
  const completion = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const selected = activeTasks[0];
  const subjectData = useMemo(() => {
    const grouped = tasks.reduce<Record<string, number>>((acc, task) => { acc[task.subject] = (acc[task.subject] || 0) + task.estimatedMinutes; return acc; }, {});
    return Object.entries(grouped).map(([subject, minutes]) => ({ subject, hours: Math.round(minutes / 60 * 10) / 10, minutes })).sort((a, b) => b.minutes - a.minutes);
  }, [tasks]);
  const subjectCompletionData = useMemo(() => {
    const grouped = tasks.reduce<Record<string, { completed: number; inProgress: number }>>((acc, task) => {
      acc[task.subject] ??= { completed: 0, inProgress: 0 };
      acc[task.subject][task.completed ? 'completed' : 'inProgress'] += 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([subject, counts]) => ({ subject, ...counts })).sort((a, b) => (b.completed + b.inProgress) - (a.completed + a.inProgress));
  }, [tasks]);
  const sortedTasks = useMemo(() => [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed) || (activeTasks.findIndex((t) => t.id === a.id) - activeTasks.findIndex((t) => t.id === b.id))), [tasks, activeTasks]);

  function announce(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  }
  function doToggle(task: StudyTask) {
    toggleTask(task.id);
    announce(task.completed ? 'Task moved back to your active plan.' : 'Nicely done — task completed.');
  }
  function doRemove(task: StudyTask) {
    removeTask(task.id);
    announce(`Removed “${task.title}” from your plan.`);
  }

  return <main className="app-shell">
    <div className="page-wrap">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><GraduationCap size={21}/></span><span>StudySpark</span></div>
        <div className="date-chip"><CalendarDays size={15}/><span>{todayLabel}</span></div>
      </header>
      <section className="hero" aria-label="Welcome">
        <div><div className="eyebrow">Your personal study space</div><h1>A little progress adds up.</h1><p>Welcome back. Here’s a clear path through what’s on your mind.</p></div>
        <div className="hero-ornament" aria-hidden="true"><Sparkles size={43}/></div>
      </section>
      <section className="stats" aria-label="Study overview">
        <article className="stat-card"><div className="stat-icon"><ListTodo size={19}/></div><div><div className="stat-label">Tasks in your plan</div><div className="stat-number" data-testid="text-total-tasks">{tasks.length}</div></div></article>
        <article className="stat-card"><div className="stat-icon pink"><CheckCheck size={19}/></div><div><div className="stat-label">Completed so far</div><div className="stat-number" data-testid="text-completed-tasks">{completed}<small> / {tasks.length}</small></div></div></article>
        <article className="stat-card"><div className="stat-icon mint"><Target size={19}/></div><div><div className="stat-label">Plan progress</div><div className="stat-number" data-testid="text-completion-percent">{completion}<small>%</small></div></div></article>
      </section>

      <div className="content-grid">
        <section className="panel" aria-labelledby="tasks-heading">
          <div className="panel-heading">
            <div><div className="section-label">Your roadmap</div><h2 className="panel-title" id="tasks-heading" style={{ marginTop: 5 }}>Study tasks</h2><p className="panel-subtitle">Sorted by what could use your attention first.</p></div>
            <button className="add-button desktop-add" data-testid="button-add-task" onClick={() => setShowForm(true)}><Plus size={15}/> Add task</button>
          </div>
          {sortedTasks.length ? <div className="task-list">
            {sortedTasks.map((task) => {
              const ranked = activeTasks.find((candidate) => candidate.id === task.id);
              return <article className={`task-row ${task.completed ? 'done' : ''}`} key={task.id} data-testid={`card-task-${task.id}`}>
                <button className={`check-button ${task.completed ? 'checked' : ''}`} data-testid={`button-toggle-task-${task.id}`} aria-label={task.completed ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`} aria-pressed={task.completed} onClick={() => doToggle(task)}>{task.completed && <Check size={14}/>}</button>
                <div>
                  <p className="task-name">{task.title}</p>
                  <div className="task-meta"><span className="subject-tag">{task.subject}</span><span>{formatDeadline(task.deadline)}</span><span>·</span><span>{task.estimatedMinutes} min</span><span className="difficulty-tag">{task.difficulty}</span>{task.isSample && <span className="sample-tag">Sample</span>}</div>
                </div>
                <div className="task-actions">{ranked && <span className="score-pill" title="Transparent priority score out of 100">{ranked.score} priority</span>}<button className="icon-button" data-testid={`button-delete-task-${task.id}`} aria-label={`Remove ${task.title}`} onClick={() => doRemove(task)}><Trash2 size={16}/></button></div>
                {ranked && <details className="task-score-details"><summary>Why this score</summary><span>Deadline ({ranked.daysUntil < 0 ? 'overdue' : ranked.daysUntil === 0 ? 'due today' : `${ranked.daysUntil} day${ranked.daysUntil === 1 ? '' : 's'} away`}) +{ranked.deadlinePoints}</span><span>Difficulty ({task.difficulty}) +{ranked.difficultyPoints}</span><span>Confidence ({task.confidence} / 5) +{ranked.confidencePoints}</span><span className="task-score-total">= {ranked.score} / 100</span></details>}
              </article>;
            })}
          </div> : <div className="empty-state"><div className="empty-icon"><BookOpen size={21}/></div><strong>Your plan starts with one task</strong><p>Add a deadline, a subject, and a small first step. We’ll help you decide what to focus on.</p><button className="primary-button" onClick={() => setShowForm(true)}><Plus size={15}/> Add your first task</button></div>}
        </section>

        <div>
          <section className="panel">
            <div className="panel-heading"><div><div className="section-label">A quick look</div><h2 className="panel-title" style={{ marginTop: 5 }}>Your study rhythm</h2></div><TrendingUp size={18} color="#9b83bc"/></div>
            <div className="chart-stack">
              <div className="chart-card"><div className="chart-head"><h3>Study time by subject</h3><span>planned hours</span></div>
                {subjectData.length ? <ResponsiveContainer width="100%" height={148}><BarChart data={subjectData} margin={{ top: 3, right: 4, left: -24, bottom: 0 }}><CartesianGrid vertical={false} stroke="#f0ebf4"/><XAxis dataKey="subject" tick={{ fontSize: 9, fill: '#938a9c' }} axisLine={false} tickLine={false} interval={0} angle={-17} textAnchor="end" height={38}/><YAxis tick={{ fontSize: 9, fill: '#a39aaa' }} axisLine={false} tickLine={false}/><Tooltip formatter={(value) => [`${value} hours`, 'Planned time']} contentStyle={{ borderRadius: 10, border: '1px solid #eee6f2', fontSize: 11 }}/><Bar dataKey="hours" name="Hours" radius={[6,6,0,0]} maxBarSize={32}>{subjectData.map((entry, index) => <Cell key={entry.subject} fill={chartColors[index % chartColors.length]}/>)}</Bar></BarChart></ResponsiveContainer> : <div className="empty-reco">Add study tasks to see your planned hours by subject.</div>}
              </div>
              <div className="chart-card"><div className="chart-head"><h3>Task completion by subject</h3><span>{completion}% overall</span></div>
                {tasks.length ? <ResponsiveContainer width="100%" height={170}><BarChart data={subjectCompletionData} layout="vertical" margin={{ top: 0, right: 4, left: 0, bottom: 0 }} barCategoryGap={10}><CartesianGrid horizontal={false} stroke="#f0ebf4"/><XAxis type="number" allowDecimals={false} tick={{ fontSize: 9, fill: '#a39aaa' }} axisLine={false} tickLine={false}/><YAxis type="category" dataKey="subject" width={82} tick={{ fontSize: 9, fill: '#938a9c' }} axisLine={false} tickLine={false}/><Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #eee6f2', fontSize: 11 }}/><Legend wrapperStyle={{ fontSize: 10, color: '#867c91' }}/><Bar dataKey="completed" name="Completed" stackId="tasks" fill="#83bca9" radius={[5,0,0,5]} maxBarSize={20}/><Bar dataKey="inProgress" name="In progress" stackId="tasks" fill="#e7dff0" radius={[0,5,5,0]} maxBarSize={20}/></BarChart></ResponsiveContainer> : <div className="empty-reco">Your progress chart will take shape as you add tasks.</div>}
              </div>
            </div>
          </section>
          <section className="panel reco-panel" aria-labelledby="recommendation-heading">
            <div className="panel-heading"><div><div className="section-label">Transparent, not magic</div><h2 className="panel-title" id="recommendation-heading" style={{ marginTop: 5 }}><Sparkles size={16}/> Why this comes first</h2></div></div>
            {selected ? <><p className="panel-subtitle" style={{ lineHeight:1.6 }}>Start with <strong style={{color:'#55436c'}}>{selected.title}</strong> in {selected.subject}. Its score is based on deadline, difficulty, and confidence.</p>
              <div className="formula"><div><strong>Priority score: {selected.score} / 100</strong></div><div className="reason-line"><span>Deadline ({selected.daysUntil <= 0 ? 'due today or overdue' : `${selected.daysUntil} day${selected.daysUntil === 1 ? '' : 's'} away`})</span><strong>+{selected.deadlinePoints}</strong></div><div className="reason-line"><span>Difficulty ({selected.difficulty})</span><strong>+{selected.difficultyPoints}</strong></div><div className="reason-line"><span>Confidence ({selected.confidence} / 5)</span><strong>+{selected.confidencePoints}</strong></div><div className="reason-line"><span>Total</span><strong>{selected.deadlinePoints} + {selected.difficultyPoints} + {selected.confidencePoints} = {selected.score}</strong></div></div>
               <details className="scoring-rules"><summary>See the scoring rules</summary><p><strong>Deadline:</strong> overdue or today +50; 1 day away +45; 2–3 days +35; 4–7 days +25; 8–14 days +15; later +5.</p><p><strong>Difficulty:</strong> easy +10, medium +20, hard +30.</p><p><strong>Confidence:</strong> 1–2 +20, 3 +12, 4–5 +5.</p><p>The points add up to a score out of 100. It is a fixed scoring algorithm, not a trained AI model.</p></details>
            </> : <div className="empty-state" style={{padding:'18px 12px'}}><div className="empty-icon"><CheckCheck size={20}/></div><strong>All caught up</strong><p>Add a task or celebrate the progress you’ve made.</p></div>}
          </section>
        </div>
      </div>
      <button className="add-button mobile-add" data-testid="button-add-task-mobile" aria-label="Add task" onClick={() => setShowForm(true)}><Plus size={22}/></button>
    </div>
    {showForm && <AddTaskDialog onClose={() => setShowForm(false)} onAdd={(task) => { addTask(task); announce('Your new task is in the plan.'); }}/>}
    {toast && <div className="toast-note" role="status" aria-live="polite">{toast}</div>}
  </main>;
}
