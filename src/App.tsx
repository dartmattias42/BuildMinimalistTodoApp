import {
  FormEvent,
  MouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

const assets = "/assets"

type View = "day" | "week" | "infinity"
type Sort = "priority" | "launched" | "completed" | "due"
type TaskStatus = "Launch" | "Done" | "Completed"
type TaskType = "Planning" | "Execution" | "Survival" | "Home-trip"

type Task = {
  id: number
  title: string
  description: string
  due: string
  status: TaskStatus
  type: TaskType
  priority: number
}

const starterTasks: Task[] = [
  {
    id: 1,
    title: "Land on Mars",
    description: "Prepare for Mars stay. Learn to return...",
    due: "2001-07-07",
    status: "Completed",
    type: "Execution",
    priority: 3,
  },
  {
    id: 2,
    title: "Land on Mars",
    description: "Prepare for a stay on Mars. Find out how to travel back...",
    due: "2001-07-08",
    status: "Done",
    type: "Planning",
    priority: 2,
  },
  ...Array.from({ length: 3 }, (_, index) => ({
    id: index + 3,
    title: "Land on Mars",
    description: "Prepare for a stay on Mars. Find out how to travel back...",
    due: `2001-07-${index + 9}`,
    status: "Launch" as const,
    type: "Survival" as const,
    priority: 1,
  })),
]

function capitalizeFirst(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

function SpaceBackdrop({
  view,
  intro = false,
}: {
  view?: View
  intro?: boolean
}) {
  const planetClass = intro
    ? "planet planet-intro"
    : view === "week"
      ? "planet planet-week"
      : view === "infinity"
        ? "planet planet-infinity"
        : "planet planet-day"

  return (
    <div className="space-backdrop" aria-hidden="true">
      <div className="star-field" />
      <div className="supernova-burst" />
      <img className={planetClass} src={`${assets}/ee9c5.svg`} alt="" />
      <img
        className={`${planetClass} planet-moon`}
        src={`${assets}/9e78b.svg`}
        alt=""
      />
    </div>
  )
}

function AddMark({ small = false }: { small?: boolean }) {
  return (
    <img
      className={small ? "add-mark add-mark-small" : "add-mark"}
      src={`${assets}/ccc23.svg`}
      alt=""
    />
  )
}

function Intro({ onLaunch }: { onLaunch: () => void }) {
  return (
    <main className="app-shell intro">
      <SpaceBackdrop intro />
      <section className="intro-content" aria-label="Done Space welcome">
        <img
          className="brand-lockup"
          src={`${assets}/0f3d9.svg`}
          alt="done space, ready for launch"
        />
        <button className="intro-add" onClick={onLaunch} type="button">
          <AddMark />
          <span>add task</span>
        </button>
      </section>
    </main>
  )
}

function BottomNav({
  view,
  onView,
  onSearch,
}: {
  view: View
  onView: (view: View) => void
  onSearch: () => void
}) {
  return (
    <nav className="bottom-nav" aria-label="Task views">
      <div className="nav-pills">
        <button
          className={view === "day" ? "active" : ""}
          onClick={() => onView("day")}
          type="button"
        >
          <img src={`${assets}/49632.svg`} alt="" />
          <span>My day</span>
        </button>
        <button
          className={view === "week" ? "active" : ""}
          onClick={() => onView("week")}
          type="button"
        >
          <img className="week-icon" src={`${assets}/cd1e7.svg`} alt="" />
          <span>My week</span>
        </button>
        <button
          className={view === "infinity" ? "active" : ""}
          onClick={() => onView("infinity")}
          type="button"
        >
          <img className="infinity-icon" src={`${assets}/0e99b.svg`} alt="" />
          <span>Infinity</span>
        </button>
      </div>
      <button
        className="search-button"
        onClick={onSearch}
        type="button"
        aria-label="Search tasks"
      >
        <img src={`${assets}/f56f8.svg`} alt="" />
      </button>
    </nav>
  )
}

function SortBar({
  sort,
  onSort,
}: {
  sort: Sort
  onSort: (sort: Sort) => void
}) {
  const options: { key: Sort label: string }[] = [
    { key: "priority", label: "Priority" },
    { key: "launched", label: "Launched" },
    { key: "completed", label: "Completed" },
    { key: "due", label: "Due date" },
  ]

  return (
    <div className="sort-bar" role="group" aria-label="Sort tasks">
      {options.map((option) => (
        <button
          className={sort === option.key ? "active" : ""}
          key={option.key}
          onClick={() => onSort(option.key)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function TaskCard({
  task,
  priority,
  isPending,
  onAdvance,
  onPriority,
}: {
  task: Task
  priority: number
  isPending: boolean
  onAdvance: () => void
  onPriority: (priority: number) => void
}) {
  const statusAsset =
    task.status === "Completed"
      ? "d3415.svg"
      : task.status === "Done"
        ? "a1fff.svg"
        : "4aaf3.svg"

  function setPriority(event: MouseEvent<HTMLButtonElement>, level: number) {
    const button = event.currentTarget
    button.classList.remove("jumping")
    void button.offsetWidth
    button.classList.add("jumping")
    onPriority(priority === level ? level - 1 : level)
  }

  return (
    <article className={`task-card${isPending ? " glimmering" : ""}`}>
      <div
        className="priority-stars"
        role="group"
        aria-label={`Priority: ${priority} of 3`}
      >
        {[3, 2, 1].map((level) => (
          <button
            aria-label={`Set priority to ${level}`}
            aria-pressed={priority >= level}
            className={priority >= level ? "filled" : ""}
            key={level}
            onAnimationEnd={(event) =>
              event.currentTarget.classList.remove("jumping")
            }
            onClick={(event) => setPriority(event, level)}
            type="button"
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="task-copy">
        <h2>{task.title}</h2>
        <p>{task.description}</p>
      </div>
      <button className="task-status" onClick={onAdvance} type="button">
        <img src={`${assets}/${statusAsset}`} alt="" />
        <span>{task.status}</span>
      </button>
    </article>
  )
}

function AddTaskPanel({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (task: Omit<Task, "id">) => void
}) {
  const [title, setTitle] = useState("")
  const [type, setType] = useState<TaskType>("Planning")
  const [due, setDue] = useState("2001-07-07")
  const [description, setDescription] = useState("")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      title: title.trim() || "Land on Mars",
      description: description.trim() || "Prepare for a stay on Mars.",
      due,
      status: "Launch",
      type,
      priority: 0,
    })
  }

  return (
    <section className="add-panel">
      <header>
        <h1>+ Add Your To-Do</h1>
        <button
          className="close-button"
          onClick={onClose}
          type="button"
          aria-label="Close task form"
        >
          <img src={`${assets}/f04d2.svg`} alt="" />
        </button>
      </header>
      <form onSubmit={submit}>
        <label>
          <span>Heading:</span>
          <input
            autoCapitalize="sentences"
            value={title}
            onChange={(event) => setTitle(capitalizeFirst(event.target.value))}
            autoFocus
          />
        </label>
        <label>
          <span>Type of task</span>
          <span className="select-wrap">
            <select
              value={type}
              onChange={(event) => setType(event.target.value as TaskType)}
            >
              <option>Planning</option>
              <option>Execution</option>
              <option>Survival</option>
              <option>Home-trip</option>
            </select>
            <img src={`${assets}/0b585.svg`} alt="" />
          </span>
        </label>
        <label>
          <span>I want it done by:</span>
          <span className="date-wrap">
            <input
              type="date"
              value={due}
              onChange={(event) => setDue(event.target.value)}
            />
            <img src={`${assets}/881f4.svg`} alt="" />
          </span>
        </label>
        <label>
          <span>Description:</span>
          <textarea
            autoCapitalize="sentences"
            value={description}
            onChange={(event) =>
              setDescription(capitalizeFirst(event.target.value))
            }
          />
        </label>
        <button className="save-button" type="submit">
          Lets do it!
        </button>
      </form>
    </section>
  )
}

function Workspace() {
  const workspaceRef = useRef<HTMLElement>(null)
  const [view, setView] = useState<View>("week")
  const [sort, setSort] = useState<Sort>("priority")
  const [showForm, setShowForm] = useState(false)
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState("")
  const [tasks, setTasks] = useState(starterTasks)
  const [pendingPriorities, setPendingPriorities] =
    useState<Record<number, number>>({})
  const priorityTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>(
    {},
  )
  const supernovaTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      Object.values(priorityTimers.current).forEach(clearTimeout)
      if (supernovaTimer.current) clearTimeout(supernovaTimer.current)
    },
    [],
  )

  const visibleTasks = useMemo(() => {
    const filtered =
      view === "infinity" ? [] : view === "day" ? tasks.slice(0, 2) : [...tasks]
    const searched = filtered.filter((task) =>
      `${task.title} ${task.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    return searched.sort((a, b) => {
      if (sort === "priority") return b.priority - a.priority
      if (sort === "due") return a.due.localeCompare(b.due)
      if (sort === "completed")
        return (
          Number(b.status === "Completed") - Number(a.status === "Completed")
        )
      return Number(a.status !== "Launch") - Number(b.status !== "Launch")
    })
  }, [query, sort, tasks, view])

  function advanceTask(id: number) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status:
                task.status === "Launch"
                  ? "Done"
                  : task.status === "Done"
                    ? "Completed"
                    : "Launch",
            }
          : task,
      ),
    )
  }

  function queuePriorityChange(id: number, priority: number) {
    clearTimeout(priorityTimers.current[id])
    setPendingPriorities((current) => ({ ...current, [id]: priority }))

    priorityTimers.current[id] = setTimeout(() => {
      setTasks((current) =>
        current.map((task) => (task.id === id ? { ...task, priority } : task)),
      )
      setPendingPriorities((current) => {
        const next = { ...current }
        delete next[id]
        return next
      })
      delete priorityTimers.current[id]
    }, 800)
  }

  function triggerSupernova() {
    const workspace = workspaceRef.current
    if (!workspace) return

    workspace.classList.remove("supernova-active")
    void workspace.offsetWidth
    workspace.classList.add("supernova-active")

    if (supernovaTimer.current) clearTimeout(supernovaTimer.current)
    supernovaTimer.current = setTimeout(() => {
      workspace.classList.remove("supernova-active")
      supernovaTimer.current = null
    }, 2200)
  }

  return (
    <main
      className={`app-shell workspace view-${view}${
        visibleTasks.length === 0 && !showForm ? " empty-state" : ""
      }`}
      ref={workspaceRef}
    >
      <SpaceBackdrop view={view} />
      <div className="workspace-content">
        {!showForm && <SortBar sort={sort} onSort={setSort} />}
        {searching && (
          <div className="search-field">
            <img src={`${assets}/f56f8.svg`} alt="" />
            <input
              aria-label="Search tasks"
              placeholder="Search the universe"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
            />
            <button onClick={() => setSearching(false)} type="button">
              Close
            </button>
          </div>
        )}
        <div className="task-list">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              priority={pendingPriorities[task.id] ?? task.priority}
              isPending={task.id in pendingPriorities}
              onAdvance={() => {
                if (task.status === "Done") triggerSupernova()
                advanceTask(task.id)
              }}
              onPriority={(priority) => queuePriorityChange(task.id, priority)}
            />
          ))}
        </div>
        {!showForm && (
          <button
            className="list-add"
            onClick={() => setShowForm(true)}
            type="button"
          >
            <AddMark />
            <span>add task</span>
          </button>
        )}
      </div>
      {showForm && (
        <AddTaskPanel
          onClose={() => setShowForm(false)}
          onSave={(task) => {
            setTasks((current) => [{ ...task, id: Date.now() }, ...current])
            setShowForm(false)
            setView("week")
          }}
        />
      )}
      <BottomNav
        view={view}
        onView={(next) => {
          setView(next)
          setShowForm(false)
        }}
        onSearch={() => setSearching((current) => !current)}
      />
    </main>
  )
}

export default function App() {
  const [launched, setLaunched] = useState(false)
  return launched ? <Workspace /> : <Intro onLaunch={() => setLaunched(true)} />
}
