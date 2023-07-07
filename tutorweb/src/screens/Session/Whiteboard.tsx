import { clear } from "console";
import React from "react";
import { useRef, useEffect, useState } from "react";

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  let globalContext: CanvasRenderingContext2D;
  let globalCanvi: HTMLCanvasElement;
  let painting: boolean = false;
  let erasing: boolean = false;
  let colorPicked: string = "black";

  let redoArray: ImageData[] = [];

  let undoArray: ImageData[] = [];
  let index: number = -1;

  const [reRender, setReRender] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas: HTMLCanvasElement = canvasRef.current;
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.8;

      canvas.addEventListener("mousedown", startPosition);
      canvas.addEventListener("mouseup", endPosition);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseout", endPosition);

      const ctx = canvas.getContext("2d");
      if (ctx) {
        globalContext = ctx;
        globalCanvi = canvas;
      }
    }
  }, []);

  const startPosition = (e: MouseEvent) => {
    painting = true;
    //to draw dots, not just drawing on movement
    draw(e);
  };

  const endPosition = (e: MouseEvent) => {
    painting = false;
    globalContext.beginPath();

    if (e.type !== "mouseout") {
      undoArray.push(
        globalContext.getImageData(0, 0, globalCanvi.width, globalCanvi.height)
      );
      index++;
    }
  };

  const draw = (e: MouseEvent) => {
    if (!painting) {
      return;
    }
    globalContext.lineWidth = 10;
    globalContext.lineCap = "round";
    globalContext.strokeStyle = colorPicked;

    //to draw the line
    globalContext.lineTo(
      getMousePos(globalCanvi, e).x,
      getMousePos(globalCanvi, e).y
    );
    globalContext.stroke();

    globalContext.beginPath();
    globalContext.moveTo(
      getMousePos(globalCanvi, e).x,
      getMousePos(globalCanvi, e).y
    );
  };

  const startPositionErasing = (e: MouseEvent) => {
    erasing = true;
    eraser(e);
  };

  const endPositionErasing = (e: MouseEvent) => {
    erasing = false;
    globalContext.beginPath();

    if (e.type !== "mouseout") {
      undoArray.push(
        globalContext.getImageData(0, 0, globalCanvi.width, globalCanvi.height)
      );
      index++;
    }
  };

  const initErasing = (e: any) => {
    globalCanvi.removeEventListener("mousemove", draw);
    globalCanvi.removeEventListener("mousedown", startPosition);
    globalCanvi.removeEventListener("mouseup", endPosition);

    globalCanvi.addEventListener("mousemove", eraser);
    globalCanvi.addEventListener("mousedown", startPositionErasing);
    globalCanvi.addEventListener("mouseup", endPositionErasing);
  };

  const eraser = (e: MouseEvent) => {
    if (!erasing) {
      return;
    }
    globalContext.lineWidth = 50;
    globalContext.lineCap = "round";
    globalContext.strokeStyle = "white";

    globalContext.lineTo(
      getMousePos(globalCanvi, e).x,
      getMousePos(globalCanvi, e).y
    );
    globalContext.stroke();

    globalContext.beginPath();
    globalContext.moveTo(
      getMousePos(globalCanvi, e).x,
      getMousePos(globalCanvi, e).y
    );
  };

  const stopErasing = () => {
    if (erasing) {
      erasing = false;
    }

    globalCanvi.removeEventListener("mousemove", eraser);
    globalCanvi.removeEventListener("mousedown", startPositionErasing);
    globalCanvi.removeEventListener("mouseup", endPositionErasing);

    globalCanvi.addEventListener("mousemove", draw);
    globalCanvi.addEventListener("mousedown", startPosition);
    globalCanvi.addEventListener("mouseup", endPosition);
  };

  const undoLast = () => {
    if (index <= 0) {
      clearCanvas();
    } else {
      index--;
      redoArray.push(undoArray.pop() as ImageData);
      globalContext.putImageData(undoArray[index], 0, 0);
      console.log(undoArray);
    }
  };

  const redoLast = () => {};

  const clearCanvas = () => {
    globalContext.clearRect(0, 0, globalCanvi.width, globalCanvi.height);

    undoArray = [];
    index = -1;
  };

  const changePenColor = () => {
    colorPicked = (document.getElementById("color-picker") as HTMLInputElement)
      .value;
  };

  const getMousePos = (canvas: HTMLCanvasElement, evt: MouseEvent) => {
    var rect = canvas.getBoundingClientRect();
    return {
      x: ((evt.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
      y: ((evt.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
    };
  };

  return (
    <div id="whiteboard-container">
      <canvas id="whiteboard-canvas" ref={canvasRef}></canvas>
      <div id="whiteboard-controls">
        <input type="color" id="color-picker" onChange={changePenColor}></input>
        <div id="pen-eraser-btns">
          <button onClick={stopErasing}>PEN</button>
          <button onClick={initErasing}>ERASER</button>
        </div>
        <div id="undo-redo-btns">
          <button onClick={undoLast}>UNDO</button>
          <button onClick={redoLast}>REDO</button>
        </div>
        <button onClick={clearCanvas}>CLEAR</button>
      </div>
    </div>
  );
};
export default Whiteboard;
