'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Pencil, Trash2, GripVertical, Sun, Moon } from 'lucide-react'

type AgendaItem = {
  id: number;
  title: string;
  speaker: string;
  duration: number;
}

export default function TimeKeeper() {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([])
  const [title, setTitle] = useState('')
  const [speaker, setSpeaker] = useState('')
  const [duration, setDuration] = useState('')
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentItemIndex < agendaItems.length - 1) {
      setCurrentItemIndex((prevIndex) => prevIndex + 1);
      setTimeLeft(agendaItems[currentItemIndex + 1]?.duration * 60 || 0);
    } else {
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, currentItemIndex, agendaItems]);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const addOrUpdateAgendaItem = () => {
    if (title && speaker && duration) {
      if (editingItem) {
        const updatedItems = agendaItems.map(item =>
          item.id === editingItem.id ? { ...item, title, speaker, duration: parseInt(duration) } : item
        );
        setAgendaItems(updatedItems);
        setEditingItem(null);
      } else {
        const newItem: AgendaItem = {
          id: Date.now(),
          title,
          speaker,
          duration: parseInt(duration),
        }
        setAgendaItems([...agendaItems, newItem])
      }
      setTitle('')
      setSpeaker('')
      setDuration('')
      setCurrentItemIndex(0)
      setTimeLeft(agendaItems[0]?.duration * 60 || 0)
      setIsRunning(false)
    }
  }

  const startEditing = (item: AgendaItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setSpeaker(item.speaker);
    setDuration(item.duration.toString());
  }

  const cancelEditing = () => {
    setEditingItem(null);
    setTitle('');
    setSpeaker('');
    setDuration('');
  }

  const deleteAgendaItem = (id: number) => {
    const newItems = agendaItems.filter(item => item.id !== id);
    setAgendaItems(newItems);
    if (currentItemIndex >= newItems.length) {
      setCurrentItemIndex(Math.max(newItems.length - 1, 0));
    }
    setTimeLeft(newItems[currentItemIndex]?.duration * 60 || 0);
    if (newItems.length === 0) {
      setIsRunning(false);
    }
  }

  const startTimer = () => {
    if (agendaItems.length > 0 && !isRunning) {
      setTimeLeft(agendaItems[currentItemIndex].duration * 60)
      setIsRunning(true)
    }
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setCurrentItemIndex(0)
    setTimeLeft(agendaItems[0]?.duration * 60 || 0)
  }

  const nextItem = () => {
    if (currentItemIndex < agendaItems.length - 1) {
      setCurrentItemIndex((prevIndex) => prevIndex + 1)
      setTimeLeft(agendaItems[currentItemIndex + 1].duration * 60)
      setIsRunning(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(agendaItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setAgendaItems(items);
  }

  const selectAgendaItem = (index: number) => {
    setCurrentItemIndex(index)
    setTimeLeft(agendaItems[index]?.duration * 60 || 0)
    setIsRunning(false)
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="container mx-auto p-4 transition-colors duration-200 ease-in-out dark:bg-gray-900">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-4 dark:text-white"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text flex items-center">
            <motion.span
              className="mr-2"
              role="img"
              aria-label="clock"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              ⏰
            </motion.span>
            Time Keeper
          </h1>
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4 text-yellow-500" />
            <Switch
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
              id="dark-mode"
              className="data-[state=checked]:bg-purple-500"
            />
            <Moon className="h-4 w-4 text-purple-500" />
          </div>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl">
              <CardHeader>
                <CardTitle className="dark:text-white">{editingItem ? 'Edit Agenda Item' : 'Add Agenda Item'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Agenda Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:dark:border-purple-500 transition-colors duration-200"
                  />
                  <Input
                    type="text"
                    placeholder="Speaker Name"
                    value={speaker}
                    onChange={(e) => setSpeaker(e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:dark:border-purple-500 transition-colors duration-200"
                  />
                  <Input
                    type="number"
                    placeholder="Duration (minutes)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:dark:border-purple-500 transition-colors duration-200"
                  />
                  <div className="space-x-2">
                    <Button onClick={addOrUpdateAgendaItem} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </Button>
                    {editingItem && (
                      <Button variant="outline" onClick={cancelEditing} className="dark:text-white dark:border-gray-600 hover:dark:bg-gray-700 transition-colors duration-200">
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl">
              <CardHeader>
                <CardTitle className="dark:text-white">Agenda List</CardTitle>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="agenda-list">
                    {(provided) => (
                      <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                        <AnimatePresence>
                          {agendaItems.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                              {(provided) => (
                                <motion.li
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ duration: 0.3 }}
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`p-2 rounded-lg flex justify-between items-center transition-all duration-200 ${
                                    index === currentItemIndex
                                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                      : 'bg-gray-100 dark:bg-gray-700'
                                  } dark:text-white cursor-pointer`}
                                  onClick={() => selectAgendaItem(index)}
                                >
                                  <div className="flex items-center">
                                    <div {...provided.dragHandleProps} className="mr-2">
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    <span>{item.title} - {item.speaker} ({item.duration} min)</span>
                                  </div>
                                  <div className="space-x-2">
                                    <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); startEditing(item); }} className="dark:text-white hover:dark:bg-gray-600 transition-colors duration-200">
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()} className="dark:text-white hover:dark:bg-gray-600 transition-colors duration-200">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent className="dark:bg-gray-800 dark:text-white border dark:border-gray-700">
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription className="dark:text-gray-300">
                                            This action cannot be undone. This will permanently delete the agenda item.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel className="dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors duration-200">Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => deleteAgendaItem(item.id)} className="bg-red-500 hover:bg-red-600 transition-colors duration-200">
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </motion.li>
                              )}
                            </Draggable>
                          ))}
                        </AnimatePresence>
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mt-4 dark:bg-gray-800 dark:border-gray-700 shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl">
            <CardHeader>
              <CardTitle className="dark:text-white">Timer</CardTitle>
            </CardHeader>
            <CardContent>
              {agendaItems.length > 0 ? (
                <div className="text-center dark:text-white">
                  <motion.h2 
                    className="text-2xl font-semibold mb-2"
                    key={currentItemIndex}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {agendaItems[currentItemIndex]?.title} - {agendaItems[currentItemIndex]?.speaker}
                  </motion.h2>
                  <motion.div 
                    className="text-6xl font-bold mb-4 font-mono bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text"
                    key={timeLeft}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                  <Progress
                    value={(1 - timeLeft / (agendaItems[currentItemIndex]?.duration * 60 || 1)) * 100}
                    className="mb-4 h-2 dark:bg-gray-700"
                    indicatorClassName="bg-gradient-to-r from-purple-500 to-pink-500"
                  />
                  <div className="space-x-2">
                    <Button onClick={startTimer} disabled={isRunning} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors duration-200">Start</Button>
                    <Button onClick={pauseTimer} disabled={!isRunning} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors duration-200">Pause</Button>
                    <Button onClick={resetTimer} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors duration-200">Reset</Button>
                    <Button onClick={nextItem} disabled={currentItemIndex === agendaItems.length - 1} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition-colors duration-200">Next</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground dark:text-gray-400">
                  No agenda items added yet. Add some items to start the timer.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}