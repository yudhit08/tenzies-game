import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { FaUndo, FaTrophy} from "react-icons/fa";
import Die from "./components/Die";
import "./App.css";

function App() {
    const [die, setDie] = useState(allNewDice());
    const [tenzies, setTenzies] = useState(false);
    const [count, handleCount] = useState(0);
    const [bestTime, setBestTime] = useState(
        () => JSON.parse(localStorage.getItem("bestTime")) || { min: 0, sec: 0 }
    );
    const [timer, setTimer] = useState({ min: 0, sec: 0 });
    const [isPlay, setIsPlay] = useState(false);
    const { width, height } = useWindowSize();

    useEffect(() => {
        const allHeld = die.every((die) => die.isHeld);
        if (allHeld) {
            const allValue = die.every((value) => value.value === die[0].value);
            if (allValue) {
                setTenzies(true);
            }
        }
    }, [die]);

    function setPlayTime() {
        isPlay &&
            setTimer((prevTime) => {
                if (prevTime.sec === 59) {
                    return {
                        ...prevTime,
                        sec: 0,
                        min: prevTime.min + 1,
                    };
                } else {
                    return {
                        ...prevTime,
                        sec: prevTime.sec + 1,
                    };
                }
            });
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setPlayTime();
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlay]);

    function allNewDice() {
        const newDice = [];
        for (let i = 0; i < 10; i++) {
            newDice.push({
                value: Math.ceil(Math.random() * 6),
                isHeld: false,
                id: nanoid(),
            });
        }
        return newDice;
    }

    function checkBestTime() {
        const prevTime = JSON.parse(localStorage.getItem("bestTime"));
        const prevTotal = prevTime ? prevTime.min + prevTime.sec : 10000;

        const currentTotal = timer.min + timer.sec;
        if (currentTotal < prevTotal) {
            setBestTime(() => ({
                min: timer.min,
                sec: timer.sec,
            }));
            localStorage.setItem("bestTime", JSON.stringify(timer));
        }
    }

    function rollDice() {
        if (tenzies) {
            setDie(allNewDice());
            setTenzies(false);
            handleCount(0);
            checkBestTime();
            setTimer(() => ({
                sec: 0,
                min: 0,
            }));
        } else {
            setDie((prevDie) =>
                prevDie.map((die) => {
                    return die.isHeld
                        ? die
                        : {
                              value: Math.ceil(Math.random() * 6),
                              isHeld: false,
                              id: nanoid(),
                          };
                })
            );
            handleCount((prevClick) => prevClick + 1);
            setIsPlay(true);
        }
    }

    useEffect(() => {
        setIsPlay(false);
    }, [tenzies]);

    function holdDice(id) {
        setDie((prevDie) =>
            prevDie.map((die) => {
                return die.id === id ? { ...die, isHeld: !die.isHeld } : die;
            })
        );
    }

    function restartGame() {
        setDie(allNewDice());
        setTenzies(false);
        handleCount(0);
        setTimer(() => ({
            sec: 0,
            min: 0,
        }));
        setIsPlay(false)
    }

    return (
        <main>
            {tenzies && <Confetti width={width} height={height} />}
            <div className='top'>
                <div className='best-time'>
                    <FaTrophy /> <span>{bestTime.min} : {bestTime.sec}</span>
                </div>
                <FaUndo className='reset' onClick={restartGame} />
            </div>
            <div className='how-to'>
                <h1 className='title'>Tenzies</h1>
                <p>
                    Roll until all dice are the same. Click each die to freeze
                    it at its current value between rolls
                </p>
            </div>
            <div className='die-container'>
                {die.map((die) => (
                    <Die
                        key={die.id}
                        id={die.id}
                        value={die.value}
                        isHeld={die.isHeld}
                        holdDice={() => holdDice(die.id)}
                    />
                ))}
            </div>
            <div className='bottom'>
                <div className='time'>
                    {timer.min} : {timer.sec}
                </div>
                <button onClick={rollDice} className='roll-dice'>
                    {tenzies ? "New Game" : "Roll Dice"}
                </button>
                <div className='count'>Roll : {count}</div>
            </div>
        </main>
    );
}

export default App;
