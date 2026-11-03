export type Task = {
	id: number;
	title: string;
	done: boolean;
};

export const tasks = new Map<number, Task>();

let nextId = 1;

export const addTask = (taskTitle: string): Task => {
	const task: Task = { id: nextId, title: taskTitle, done: false };
	tasks.set(nextId, task);
	nextId++;
	return task;
};
export const updateTask = (
	task: Task,
	newTaskTitle: string,
	newDone: boolean,
): Task => {
	const updatedTask: Task = task;
	updatedTask.title = newTaskTitle;
	updatedTask.done = newDone ?? task.done;
	return updatedTask;
};
