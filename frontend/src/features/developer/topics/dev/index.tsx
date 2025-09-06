import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface IBoardSteps {
  id: string;
  moves: IKanbanBoard[];
  currentStep: number;
}

interface IPayload {
  boardId: string;
  taskId: string;
}

interface IModal {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

interface IQuestion {
  question: string;
  options: { option: string; id: string; isCorrect: boolean }[];
}

interface IQuestions {
  quizName: string;
  questions: IQuestion[];
}

interface IQuiz {
  id: string;
  quiz: IQuestions;
}

interface IIsValuePresent {
  selectedGrid: string[];
  rowIndex: number;
  colIndex: number;
}

interface ITest {
  quizApp: IQuiz | undefined;
  onClose: () => void;
}

interface IRenderGrid {
  isDisabled: boolean;
  selectedGrid: string[];
  setSelectedGrid: React.Dispatch<React.SetStateAction<string[]>>;
}

interface ISelectedOptions {
  questionIndex: number;
  selectedId: string;
}

const STATUS = {
  TODO: 0,
  INPROGRESS: 1,
  DONE: 2,
} as const;
type STATUS = (typeof STATUS)[keyof typeof STATUS];

interface ITask {
  id: string;
  task: string;
  status: STATUS;
}

interface IKanbanBoard {
  id: string;
  boardName: string;
  todo: ITask[];
  inProgress: ITask[];
  done: ITask[];
}

type Direction = 'R' | 'L' | 'U' | 'D';

interface IPosition {
  rowIndex: number;
  colIndex: number;
}

interface IState {
  position: IPosition[];
  start: boolean;
  speed: number[];
  direction: Direction;
}

const GRID = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
];

const Modal = ({ children, isOpen, onClose }: IModal) => {
  if (!isOpen) return null;
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 z-10 bg-black/60 w-svw h-svh">
      <button
        className="cursor-pointer absolute left-auto right-1/6 top-1/18"
        onClick={() => onClose()}
      >
        X
      </button>
      <div className="absolute w-full h-full flex flex-col items-center justify-start gap-2 top-1/12">
        {children}
      </div>
    </div>
  );
};

const isValuePresent = ({
  selectedGrid,
  rowIndex,
  colIndex,
}: IIsValuePresent) => {
  const val = `${rowIndex}${colIndex}`;
  const isPresent = selectedGrid && selectedGrid.find(item => item === val);
  if (!isPresent) return false;
  return true;
};

const RenderGrid = ({
  isDisabled,
  selectedGrid,
  setSelectedGrid,
}: IRenderGrid) => {
  const handleGridSelect = (rowIndex: number, colIndex: number) => {
    const val = `${rowIndex}${colIndex}`;
    setSelectedGrid([...selectedGrid, val]);
  };

  return (
    <div className="flex items-center">
      {GRID.map((row, rowIndex) => {
        return (
          <div key={rowIndex}>
            {row.map((_, colIndex) => {
              const isChecked = isValuePresent({
                selectedGrid,
                rowIndex,
                colIndex,
              });
              return (
                <div
                  className={`h-12 w-12 flex items-center justify-center border border-red-600 ${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed'} ${
                    isChecked ? '!bg-red-600' : ''
                  }`}
                  key={colIndex}
                  onClick={() =>
                    !isDisabled ? handleGridSelect(rowIndex, colIndex) : {}
                  }
                ></div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const removeElement = (arr: string[]) => {
  const updatedArr = arr.slice(1);
  return updatedArr;
};

const DevelopmentOne = () => {
  const [selectedGrid, setSelectedGrid] = useState<string[]>([]);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    let interval: number;

    const startRemoving = () => {
      setTimeout(() => {}, 400);

      interval = setInterval(() => {
        const updatedGrid = removeElement(selectedGrid);
        setSelectedGrid(updatedGrid);
        if (updatedGrid.length === 0) {
          setIsDisabled(false);
        }
      }, 200);
    };

    if (selectedGrid.length === 9 || isDisabled) {
      setIsDisabled(true);
      startRemoving();
    }

    return () => clearInterval(interval);
  }, [isDisabled, selectedGrid]);

  return (
    <div>
      <div>One</div>
      <div className="bg-black flex items-center justify-center py-4">
        <RenderGrid
          isDisabled={isDisabled}
          selectedGrid={selectedGrid}
          setSelectedGrid={setSelectedGrid}
        />
      </div>
    </div>
  );
};

const DevelopmentTwo = () => {
  const [clock, setClock] = useState({
    hour: new Date().getHours(),
    min: new Date().getMinutes(),
    sec: new Date().getSeconds(),
  });

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setClock({
        hour: new Date().getHours(),
        min: new Date().getMinutes(),
        sec: new Date().getSeconds(),
      });
    }, 200);
    return () => clearInterval(clockInterval);
  }, [clock]);

  return (
    <div>
      <div>Two</div>
      <div className="bg-black flex items-center justify-center py-4">
        {clock.hour} - {clock.min} - {clock.sec}
      </div>
    </div>
  );
};

const DevelopmentThree = () => {
  const [countMin, setCountMin] = useState<number>(0);
  const [countDown, setCountDown] = useState<number>(0);
  const [start, setStart] = useState<boolean>(false);
  const [laps, setLaps] = useState<string[]>([]);

  useEffect(() => {
    if (!start) return;

    const interval = setInterval(() => {
      const count = countDown + 1;
      if (count > 60) {
        setCountMin(prev => {
          return prev + 1;
        });
        setCountDown(0);
      }
      setCountDown(prev => {
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [countDown, start]);

  const handleReset = () => {
    setStart(false);
    setCountDown(0);
    setCountMin(0);
    setLaps([]);
  };

  const handleStart = () => {
    setStart(prev => !prev);
  };

  const handleCountLap = () => {
    const time = `${countMin}-${countDown}`;
    if (!countDown && !countMin) return;
    setLaps([time, ...laps]);
  };

  return (
    <div>
      <div>Three</div>
      <div className="bg-black flex flex-col space-y-2 items-center justify-center py-4">
        {countMin} - {countDown}
        <div className="flex gap-2 items-center justify-center">
          <button onClick={() => handleCountLap()}>Count Lap</button>
          <button onClick={() => handleStart()}>
            {start ? 'Stop' : 'Start'}
          </button>
          <button onClick={() => handleReset()}>Reset</button>
        </div>
        <ul>
          {laps.map((i, j) => (
            <li key={j}>{i}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const DevelopmentFour = () => {
  const [todo, setTodo] = useState<{
    input: string;
    list: string[];
  }>({
    input: '',
    list: [],
  });

  const handleAdd = () => {
    const text = todo.input;
    const list = [text, ...todo.list];

    setTodo({
      input: '',
      list: list,
    });
  };

  return (
    <div>
      <div>Four</div>
      <div className="bg-black flex flex-col space-y-2 items-center justify-center py-4">
        <div className="flex gap-2">
          <input
            type="text"
            name="input"
            value={todo.input}
            onChange={e => {
              const { value } = e.target;
              setTodo({
                input: value,
                list: todo.list,
              });
            }}
            className="border bg-red-900"
          />
          <button onClick={() => handleAdd()}>Add</button>
        </div>
        <ul>
          {todo.list.map((i, j) => (
            <li key={j} className="">
              {i}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const AttempTest = ({ quizApp, onClose }: ITest) => {
  const [selectedOptions, setSelectedOptions] = useState<ISelectedOptions[]>(
    []
  );
  const [showScore, setShowScore] = useState(false);

  const handleClick = (index: number, id: string) => {
    const isIndexPresent = selectedOptions.find(i => i.questionIndex === index);

    if (!isIndexPresent) {
      return setSelectedOptions([
        ...selectedOptions,
        {
          questionIndex: index,
          selectedId: id,
        },
      ]);
    }

    const filterOutIndex = selectedOptions.filter(
      i => i.questionIndex !== index
    );
    setSelectedOptions([
      ...filterOutIndex,
      { questionIndex: index, selectedId: id },
    ]);
  };

  const getScore = () => {
    if (!quizApp) return 0;

    let total = 0;

    quizApp.quiz.questions.map(i =>
      i.options.map(j =>
        selectedOptions.filter(l => l.selectedId === j.id) && j.isCorrect
          ? (total += 1)
          : ''
      )
    );

    return total;
  };

  if (!quizApp) return null;
  return (
    <div className="flex flex-col gap-2">
      <div>
        <div>Name :- {quizApp.quiz.quizName}</div>
        <div>
          <p>Id :- </p> {quizApp.id}
        </div>
      </div>

      {!showScore && (
        <div className="flex flex-col gap-2">
          {quizApp.quiz.questions.map((i, j) => {
            return (
              <div key={j}>
                Question {j + 1}: {i.question}
                {i.options.map((k, l) => {
                  const isChecked = selectedOptions.find(
                    i => i.selectedId === k.id
                  );
                  return (
                    <div key={l} className="flex gap-2">
                      {k.option}
                      <input
                        type="radio"
                        onChange={() => handleClick(j, k.id)}
                        checked={isChecked ? true : false}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {showScore && (
        <div className="flex items-center justify-between">
          <p>Score: {getScore()}</p>
          <button onClick={() => onClose()}>Close</button>
        </div>
      )}

      <button onClick={() => setShowScore(true)}>Submit</button>
    </div>
  );
};

const EditTest = ({ quizApp, onClose }: ITest) => {
  if (!quizApp) return null;
  return (
    <div>
      <div>
        <div>Name :- {quizApp.quiz.quizName}</div>
        <div>
          <p>Id :- </p> {quizApp.id}
        </div>
      </div>
      <div onClick={() => onClose()}>X</div>
    </div>
  );
};

const DevelopmentFive = () => {
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizApp, setQuizApp] = useState<IQuiz[]>([]);
  const [question, setQuestion] = useState<IQuestions>({
    quizName: '',
    questions: Array(5)
      .fill(null)
      .map(() => ({
        question: '',
        options: Array(4)
          .fill(null)
          .map(() => ({
            option: '',
            id: uuidv4(),
            isCorrect: false,
          })),
      })),
  });
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);

  const handleAddQuiz = () => {
    setIsAddingQuiz(true);
  };

  const handleClick = (action: 'I' | 'D') => {
    if (action === 'I') return setCurrentIndex(prev => prev + 1);
    return setCurrentIndex(prev => prev - 1);
  };

  const handleSubmit = () => {
    setQuizApp(prev => [
      ...prev,
      {
        id: uuidv4(),
        quiz: question,
      },
    ]);
    // Reset state
    setQuestion({
      quizName: '',
      questions: Array(5)
        .fill(null)
        .map(() => ({
          question: '',
          options: Array(4)
            .fill(null)
            .map(() => ({
              option: '',
              id: uuidv4(),
              isCorrect: false,
            })),
        })),
    });
    setIsAddingQuiz(false);
    setCurrentIndex(0);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    action: 'QN' | 'Q' | 'O' | 'IC',
    index?: number,
    optionIndex?: number
  ) => {
    const value = e.target.value;

    if (action === 'QN') {
      setQuestion(prev => ({
        ...prev,
        quizName: value,
      }));
    } else if (action === 'Q' && typeof index === 'number') {
      const updatedQuestions = [...question.questions];
      updatedQuestions[index].question = value;
      setQuestion(prev => ({
        ...prev,
        questions: updatedQuestions,
      }));
    } else if (
      action === 'O' &&
      typeof index === 'number' &&
      typeof optionIndex === 'number'
    ) {
      const updatedQuestions = [...question.questions];
      updatedQuestions[index].options[optionIndex].option = value;
      setQuestion(prev => ({
        ...prev,
        questions: updatedQuestions,
      }));
    } else if (
      action === 'IC' &&
      typeof index === 'number' &&
      typeof optionIndex === 'number'
    ) {
      const updatedQuestions = [...question.questions];
      // Make all options isCorrect false first
      updatedQuestions[index].options = updatedQuestions[index].options.map(
        (opt, i) => ({
          ...opt,
          isCorrect: i === optionIndex,
        })
      );
      setQuestion(prev => ({
        ...prev,
        questions: updatedQuestions,
      }));
    }
  };

  return (
    <div>
      <Modal
        isOpen={isAttemptModalOpen}
        onClose={() => setIsAttemptModalOpen(!isAttemptModalOpen)}
      >
        <AttempTest
          quizApp={quizApp.find(i => i.id === selectedTestId)}
          onClose={() => setIsAttemptModalOpen(!isAttemptModalOpen)}
        />
      </Modal>
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(!isEditModalOpen)}
      >
        <EditTest
          quizApp={quizApp.find(i => i.id === selectedTestId)}
          onClose={() => setIsEditModalOpen(!isEditModalOpen)}
        />
      </Modal>
      <div>Five</div>
      <div className="bg-black flex flex-col space-y-2 items-center justify-center py-4">
        {!isAddingQuiz && <button onClick={handleAddQuiz}>Add Quiz</button>}
        {isAddingQuiz &&
          Array(5)
            .fill(0)
            .map((_, j) => {
              if (j !== currentIndex) return null;
              return (
                <div className="flex flex-col gap-2" key={j}>
                  {j === 0 ? (
                    <div className="flex flex-col gap-2">
                      <div>
                        <p>Quiz Name</p>
                        <input
                          type="text"
                          className="border bg-gray-400"
                          value={question.quizName}
                          onChange={e => handleChange(e, 'QN')}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div>
                        <p>Question {j}</p>
                        <input
                          type="text"
                          className="border bg-gray-400"
                          value={question.questions[j - 1].question}
                          onChange={e => handleChange(e, 'Q', j - 1)}
                        />
                      </div>
                      {question.questions[j - 1].options.map((opt, l) => (
                        <div key={opt.id} className="flex flex-col">
                          <p>Option {l + 1}</p>
                          <input
                            type="text"
                            className="border bg-gray-400"
                            value={opt.option}
                            onChange={e => handleChange(e, 'O', j - 1, l)}
                          />
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="radio"
                              name={`isCorrect-${j - 1}`}
                              checked={opt.isCorrect}
                              onChange={e => handleChange(e, 'IC', j - 1, l)}
                            />
                            Is Correct
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    {currentIndex !== 0 && (
                      <button onClick={() => handleClick('D')}>Prev</button>
                    )}
                    {currentIndex !== 4 && (
                      <button onClick={() => handleClick('I')}>Next</button>
                    )}
                    {currentIndex === 4 && (
                      <button onClick={handleSubmit}>Submit</button>
                    )}
                  </div>
                </div>
              );
            })}
        <ul>
          {quizApp.map((i, j) => (
            <li key={j} className="flex gap-2 items-center justify-center">
              {i.quiz.quizName}
              <button
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTestId(i.id);
                  setIsAttemptModalOpen(!isAttemptModalOpen);
                }}
              >
                Attempt
              </button>
              <button
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTestId(i.id);
                  setIsEditModalOpen(!isEditModalOpen);
                }}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const DUMMY_TASK = [
  {
    id: uuidv4(),
    boardName: 'TASK',
    todo: [
      {
        id: uuidv4(),
        task: 'Walk',
        status: STATUS.TODO,
      },
      {
        id: uuidv4(),
        task: 'GYM',
        status: STATUS.TODO,
      },
      {
        id: uuidv4(),
        task: 'DRINK WATER',
        status: STATUS.TODO,
      },
    ],
    done: [],
    inProgress: [],
  },
  {
    id: uuidv4(),
    boardName: 'TASK 2',
    todo: [
      {
        id: uuidv4(),
        task: 'Walk',
        status: STATUS.TODO,
      },
      {
        id: uuidv4(),
        task: 'GYM',
        status: STATUS.TODO,
      },
      {
        id: uuidv4(),
        task: 'DRINK WATER',
        status: STATUS.TODO,
      },
    ],
    done: [],
    inProgress: [],
  },
  {
    id: uuidv4(),
    boardName: 'TASK 3',
    todo: [
      {
        id: uuidv4(),
        task: 'Walk',
        status: STATUS.TODO,
      },
      {
        id: uuidv4(),
        task: 'GYM',
        status: STATUS.TODO,
      },
      {
        id: uuidv4(),
        task: 'DRINK WATER',
        status: STATUS.TODO,
      },
    ],
    done: [],
    inProgress: [],
  },
];

const transform = (boards: IKanbanBoard[]) => {
  const transFormedSteps = boards.map(i => {
    return {
      id: i.id,
      moves: [{ ...i }],
      currentStep: 0,
    };
  });
  return transFormedSteps;
};

const DevelopmentSix = () => {
  const [boards, setBoards] = useState<IKanbanBoard[]>(DUMMY_TASK);
  const [boardsSteps, setStepsBoards] = useState<IBoardSteps[]>(
    transform(boards)
  );

  if (!boards.length) return;

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    payload: IPayload
  ) => {
    e.dataTransfer.setData('DRAG_START', JSON.stringify(payload));
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    status: Exclude<Exclude<keyof IKanbanBoard, 'id'>, 'boardName'>
  ) => {
    const DRAG_START_PAYLOAD = e.dataTransfer.getData('DRAG_START');
    const parsedData = JSON.parse(DRAG_START_PAYLOAD) as IPayload;

    const { boardId, taskId } = parsedData;

    const currentBoardData = boards.find(board => board.id === boardId);

    if (currentBoardData) {
      const task =
        currentBoardData.todo.find(task => task.id === taskId) ||
        currentBoardData.inProgress.find(task => task.id === taskId) ||
        currentBoardData.done.find(task => task.id === taskId);

      if (!task) return;

      const updatedBoards = boards.map(board => {
        if (board.id === boardId) {
          return {
            ...board,
            todo: board.todo.filter(t => t.id !== taskId),
            inProgress: board.inProgress.filter(t => t.id !== taskId),
            done: board.done.filter(t => t.id !== taskId),
            [status]: [
              ...board[status],
              {
                ...task,
                status: status === 'todo' ? 0 : status === 'inProgress' ? 1 : 2,
              },
            ],
          };
        }
        return board;
      });

      setBoards(updatedBoards);

      // update the steps board
      const updatedSteps = updatedBoards.filter(i => i.id === boardId);
      const updatedList = boardsSteps.map(i => {
        if (i.id === boardId) {
          return {
            ...i,
            moves: [...i.moves, ...updatedSteps],
          };
        } else {
          return i;
        }
      });

      setStepsBoards(updatedList);
    }
  };

  const handleMove = (move: 'I' | 'D', id: string) => {
    setStepsBoards(prevSteps =>
      prevSteps.map(boardStep => {
        if (boardStep.id === id) {
          let newStep = boardStep.currentStep;
          if (
            move === 'I' &&
            boardStep.currentStep < boardStep.moves.length - 1
          ) {
            newStep += 1;
          }
          if (move === 'D' && boardStep.currentStep > 0) {
            newStep -= 1;
          }

          // Update the board itself
          const updatedBoards = boards.map(board => {
            if (board.id === id) {
              return boardStep.moves[newStep];
            }
            return board;
          });

          setBoards(updatedBoards);

          return {
            ...boardStep,
            currentStep: newStep,
          };
        }
        return boardStep;
      })
    );
  };

  const isDisabled = (move: 'I' | 'D', id: string) => {
    const findData = boardsSteps.find(i => i.id === id);
    if (!findData) return true;

    if (move === 'I') {
      if (findData.currentStep === findData.moves.length - 1) {
        return true;
      }
      return false;
    }

    if (move === 'D') {
      if (findData.currentStep === 0) {
        return true;
      }
      return false;
    }
  };

  return (
    <div>
      <div>Six</div>
      <div className="flex items-center justify-center flex-col">
        {boards.map((i, j) => (
          <div key={j} className="flex flex-col items-center w-full mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p>{i.boardName}</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleMove('D', i.id)}
                  disabled={isDisabled('D', i.id)}
                  className="disabled:cursor-not-allowed"
                >
                  Redo
                </button>
                <button
                  onClick={() => handleMove('I', i.id)}
                  disabled={isDisabled('I', i.id)}
                  className="disabled:cursor-not-allowed"
                >
                  Undo
                </button>
              </div>
            </div>
            <div className="flex gap-2 items-start justify-center w-full">
              <div
                className="flex flex-col border-2 border-red-600 p-4 rounded-md items-center w-1/3 min-h-56 max-h-56 overflow-x-scroll"
                onDrop={e => handleDrop(e, 'todo')}
                onDragOver={e => e.preventDefault()}
              >
                <p className="border-b-2 border-red-600 w-full flex justify-center items-center">
                  TODO
                </p>
                {i.todo.map((l, m) => (
                  <div
                    key={m}
                    className="mt-4 border-2 border-red-600 p-4 rounded-md w-full cursor-pointer"
                    draggable
                    onDragStart={e => {
                      const payload = {
                        boardId: i.id,
                        taskId: l.id,
                      };
                      handleDragStart(e, payload);
                    }}
                  >
                    {l.task}
                  </div>
                ))}
              </div>
              <div
                className="flex flex-col border-2 border-red-600 p-4 rounded-md items-center w-1/3 min-h-56 max-h-56 overflow-x-scroll"
                onDrop={e => handleDrop(e, 'inProgress')}
                onDragOver={e => e.preventDefault()}
              >
                <p className="border-b-2 border-red-600 w-full flex justify-center items-center">
                  INPROGRESS
                </p>
                {i.inProgress.map((l, m) => (
                  <div
                    key={m}
                    className="mt-4 border-2 border-red-600 p-4 rounded-md w-full cursor-pointer"
                    draggable
                    onDragStart={e => {
                      const payload = {
                        boardId: i.id,
                        taskId: l.id,
                      };
                      handleDragStart(e, payload);
                    }}
                  >
                    {l.task}
                  </div>
                ))}
              </div>
              <div
                className="flex flex-col border-2 border-red-600 p-4 rounded-md items-center w-1/3 min-h-56 max-h-56 overflow-x-scroll"
                onDrop={e => handleDrop(e, 'done')}
                onDragOver={e => e.preventDefault()}
              >
                <p className="border-b-2 border-red-600 w-full flex justify-center items-center">
                  DONE
                </p>
                {i.done.map((l, m) => (
                  <div
                    key={m}
                    className="mt-4 border-2 border-red-600 p-4 rounded-md w-full cursor-pointer"
                    draggable
                    onDragStart={e => {
                      const payload = {
                        boardId: i.id,
                        taskId: l.id,
                      };
                      handleDragStart(e, payload);
                    }}
                  >
                    {l.task}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GRID_SIZE = 12;

const getDirection = (key: string) => {
  switch (key) {
    case 'ArrowLeft':
      return 'L';
    case 'ArrowRight':
      return 'R';
    case 'ArrowUp':
      return 'U';
    case 'ArrowDown':
      return 'D';
    default:
      return null;
  }
};

const getUpdatedPosition = <T extends IState>(state: T) => {
  const { direction, position } = state;

  const headIndex = position.length - 1;
  const tailIndex = 0;

  const head = position[headIndex];
  const tail = position[tailIndex];

  const headRow = head.rowIndex;
  const headCol = head.colIndex;

  const tailRow = tail.rowIndex;
  const tailCol = tail.colIndex;

  const incrementedRow = headRow + 1;
  const incrementedCol = headCol + 1;

  const decrementedRow = tailRow - 1;
  const decrementedCol = tailCol - 1;

  const removeTail = position.filter(
    i => i.rowIndex !== tailRow && i.colIndex !== tailCol
  );

  const moveHeadToRight = [
    ...removeTail,
    {
      rowIndex: headRow,
      colIndex: incrementedCol,
    },
  ];

  const moveHeadToLeft = [
    ...removeTail,
    {
      rowIndex: headRow,
      colIndex: decrementedCol,
    },
  ];

  const moveHeadToDown = [
    ...removeTail,
    {
      rowIndex: incrementedRow,
      colIndex: headCol,
    },
  ];

  const moveHeadToUp = [
    ...removeTail,
    {
      rowIndex: decrementedRow,
      colIndex: headCol,
    },
  ];

  switch (direction) {
    case 'R':
      return moveHeadToRight;
    case 'L':
      return moveHeadToLeft;
    case 'D':
      return moveHeadToDown;
    case 'U':
      return moveHeadToUp;
    default:
      return position;
  }
};

const useHangleGameLogic = <T extends IState>(
  state: T,
  setState: (arg: T) => void
) => {
  const { direction, speed } = state;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      const direction = getDirection(key);
      if (typeof direction === 'string') {
        setState({
          ...state,
          direction: direction,
        });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction, state, setState]);

  useEffect(() => {
    const updatePosition = setInterval(() => {
      const updatedPosition = getUpdatedPosition(state);
      setState({
        ...state,
        position: updatedPosition,
      });
    }, speed[0]);
    return () => clearInterval(updatePosition);
  }, [speed, state, setState]);
};

const DevelopmentSeven = () => {
  const [state, setState] = useState<IState>({
    start: true,
    direction: 'R',
    position: [
      {
        rowIndex: 0,
        colIndex: 0,
      },
    ],
    speed: [1000, 500, 200],
  });

  useHangleGameLogic(state, setState);

  return (
    <div>
      <div>Seven</div>
      <div className="bg-black flex flex-col items-center justify-center py-4">
        {Array(GRID_SIZE)
          .fill(0)
          .map((_i, j) => {
            return (
              <div key={j} className="flex flex-row">
                {Array(GRID_SIZE)
                  .fill(0)
                  .map((_k, l) => {
                    const { position } = state;
                    const isSnakeOnCurrentGrid = position.find(
                      i => i.rowIndex === j && i.colIndex === l
                    );
                    return (
                      <div
                        key={l}
                        className={`h-12 w-12 border-1 border-red-600 cursor-pointer ${isSnakeOnCurrentGrid ? 'bg-red-600' : ''}`}
                      ></div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

const Development = () => {
  return (
    <div className="p-4 bg-black">
      <DevelopmentOne />
      <DevelopmentTwo />
      <DevelopmentThree />
      <DevelopmentFour />
      <DevelopmentFive />
      <DevelopmentSix />
      <DevelopmentSeven />
    </div>
  );
};

export default Development;
