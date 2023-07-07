import { clear } from "console";
import React from "react";
import { useRef, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { IWhiteboard } from ".";

interface IPoint {
  x: number;
  y: number;
}

interface ILine {
  points: Array<IPoint>;
  color: string;
}

const Whiteboard = ({ socket, sessionId, role }: IWhiteboard) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  let globalContext: CanvasRenderingContext2D;
  let globalCanvi: HTMLCanvasElement;
  let painting: boolean = false;
  let erasing: boolean = false;
  let penSize: number = 10;
  let eraserSize: number = 30;
  let colorPicked: string = "black";

  let currentDraw = new Array<ILine>();
  let myObjects: ILine[][] = [];
  let theirObjects: ILine[][] = [];
  let redoObjects: ILine[][] = [];

  let allObjects: ILine[][][] = [myObjects, theirObjects];

  let myLines = new Array<ILine>();
  let theirLines = new Array<ILine>();
  let undoIndex: number = -1;
  let redoIndex: number = -1;

  const [reRender, setReRender] = useState(false);
  const [showPenOptions, setShowPenOptions] = useState(false);
  const [showEraserOptions, setShowEraserOptions] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas: HTMLCanvasElement = canvasRef.current;
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.8;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        globalContext = ctx;
        globalCanvi = canvas;
      }

      globalCanvi.addEventListener("mousedown", onMouseDownDraw);
      globalCanvi.addEventListener("mouseup", onMouseUpDraw);
      globalCanvi.addEventListener("mousemove", draw);
      globalCanvi.addEventListener("mouseout", onMouseUpDraw);
    }
  }, []);

  useEffect(() => {
    socket.on("newLines", (data) => {
      if (data.from !== role) {
        theirLines.push(data.lineSegment);
      }

      paintPeerData(data.lineSegment, data.lineSegment.color, data.lineSize);
    });

    socket.on("undoLast", (data) => {
      if (data.from !== role) {
        theirObjects.pop();
        reDrawCanvas();
      }
    });

    socket.on("redoLast", (data) => {
      if (data.from !== role) {
        theirObjects.push(data.redoObj);
        reDrawCanvas();
      }
    });

    socket.on("endLineSeg", (data) => {
      if (data.from !== role) {
        theirObjects.push(data.line);
        globalContext.beginPath();
      }
    });

    socket.on("clearCanv", () => {
      globalContext.clearRect(0, 0, globalCanvi.width, globalCanvi.height);
      undoIndex = -1;
    });
  }, []);

  const paintPeerData = (
    lineSeg: ILine,
    lineSegColor: string,
    lineSegSize: number
  ) => {
    globalContext.lineWidth = lineSegSize;
    globalContext.lineCap = "round";
    globalContext.strokeStyle = lineSegColor;

    globalContext.lineTo(lineSeg.points[0].x, lineSeg.points[0].y);
    globalContext.stroke();

    globalContext.beginPath();
    globalContext.moveTo(lineSeg.points[0].x, lineSeg.points[0].y);
  };

  const onMouseDownDraw = (e: MouseEvent) => {
    painting = true;
    globalContext.beginPath();
    let pos = getMousePos(globalCanvi, e);
    myLines.push({
      points: [pos],
      color: colorPicked,
    });
    currentDraw.push({
      points: [pos],
      color: colorPicked,
    });
    socket.emit("newLineSegment", {
      lineSeg: myLines[myLines.length - 1],
      lineSize: penSize,
      from: role,
      room: sessionId,
    });
  };

  const onMouseDownErase = (e: MouseEvent) => {
    erasing = true;
    let pos = getMousePos(globalCanvi, e);
    myLines.push({
      points: [pos],
      color: "white",
    });
    socket.emit("newLineSegment", {
      lineSeg: myLines[myLines.length - 1],
      lineSize: eraserSize,
      from: role,
      room: sessionId,
    });
  };

  const draw = (e: MouseEvent) => {
    if (!painting && !erasing) {
      return;
    } else if (painting) {
      let pos = getMousePos(globalCanvi, e);
      let lastPos = myLines[myLines.length - 1].points[0];
      if (getDistance(pos, lastPos) > 2) {
        myLines.push({
          points: [pos],
          color: colorPicked,
        });
        currentDraw.push({
          points: [pos],
          color: colorPicked,
        });
        socket.emit("newLineSegment", {
          lineSeg: myLines[myLines.length - 1],
          lineSize: penSize,
          from: role,
          room: sessionId,
        });
      }
      globalContext.lineWidth = penSize;
      globalContext.lineCap = "round";
      globalContext.strokeStyle = colorPicked;

      globalContext.lineTo(pos.x, pos.y);
      globalContext.stroke();

      globalContext.beginPath();
      globalContext.moveTo(pos.x, pos.y);
    } else if (erasing) {
      let pos = getMousePos(globalCanvi, e);
      let lastPos = myLines[myLines.length - 1].points[0];
      if (getDistance(pos, lastPos) > 5) {
        myLines.push({
          points: [pos],
          color: "white",
        });
        socket.emit("newLineSegment", {
          lineSeg: myLines[myLines.length - 1],
          lineSize: eraserSize,
          from: role,
          room: sessionId,
        });
      }
      globalContext.lineWidth = eraserSize;
      globalContext.lineCap = "round";
      globalContext.strokeStyle = "white";

      globalContext.lineTo(pos.x, pos.y);
      globalContext.stroke();

      globalContext.beginPath();
      globalContext.moveTo(pos.x, pos.y);
    }
  };

  const onMouseUpDraw = (e: MouseEvent) => {
    painting = false;
    globalContext.beginPath();

    if (e.type !== "mouseout") {
      socket.emit("endLineSegment", {
        from: role,
        room: sessionId,
        line: currentDraw,
      });
      myObjects.push(currentDraw);
      currentDraw = [];
    }
  };

  const onMouseUpErase = (e: MouseEvent) => {
    erasing = false;
    globalContext.beginPath();

    socket.emit("endLineSegment", {
      from: role,
      room: sessionId,
    });
  };

  const initErasing = () => {
    globalCanvi.removeEventListener("mousedown", onMouseDownDraw);
    globalCanvi.removeEventListener("mouseup", onMouseUpDraw);

    globalCanvi.addEventListener("mousedown", onMouseDownErase);
    globalCanvi.addEventListener("mouseup", onMouseUpErase);
  };

  const stopErasing = () => {
    globalCanvi.removeEventListener("mousedown", onMouseDownErase);
    globalCanvi.removeEventListener("mouseup", onMouseUpErase);

    globalCanvi.addEventListener("mousedown", onMouseDownDraw);
    globalCanvi.addEventListener("mouseup", onMouseUpDraw);
  };

  const redoLast = () => {
    if (redoObjects.length > 0) {
      socket.emit("redoLast", {
        from: role,
        room: sessionId,
        redoObj: redoObjects[redoObjects.length - 1],
      });
      myObjects.push(redoObjects[redoObjects.length - 1]);
      redoObjects.pop();
      reDrawCanvas();
    }
  };

  const helper = () => {
    console.log(allObjects);
  };

  const reDrawCanvas = () => {
    globalContext.clearRect(0, 0, globalCanvi.width, globalCanvi.height);
    for (let i = 0; i < allObjects.length; i++) {
      globalContext.beginPath();
      for (let j = 0; j < allObjects[i].length; j++) {
        globalContext.beginPath();
        for (let k = 0; k < allObjects[i][j].length; k++) {
          globalContext.lineWidth = penSize;
          globalContext.lineCap = "round";
          globalContext.strokeStyle = allObjects[i][j][k].color;
          globalContext.lineTo(
            allObjects[i][j][k].points[0].x,
            allObjects[i][j][k].points[0].y
          );
          globalContext.stroke();
          globalContext.beginPath();
          globalContext.moveTo(
            allObjects[i][j][k].points[0].x,
            allObjects[i][j][k].points[0].y
          );
        }
      }
    }
  };

  const clearCanvas = () => {
    globalContext.clearRect(0, 0, globalCanvi.width, globalCanvi.height);

    undoIndex = -1;

    socket.emit("clearCanvas", {
      from: role,
      room: sessionId,
    });
  };

  const changePenColor = () => {
    colorPicked = (document.getElementById("color-picker") as HTMLInputElement)
      .value;
  };

  const changePenSize = (size: number): any => {
    stopErasing();
    penSize = size;
  };

  const changeEraserSize = (size: number): any => {
    initErasing();
    eraserSize = size;
  };

  //function to get distance between two points
  const getDistance = (p1: IPoint, p2: IPoint) => {
    let x = p2.x - p1.x;
    let y = p2.y - p1.y;
    return Math.sqrt(x * x + y * y);
  };

  const getMousePos = (canvas: HTMLCanvasElement, evt: MouseEvent): IPoint => {
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
          <div className="pen-eraser-options">
            <button onClick={stopErasing}>PEN</button>
            <button onClick={() => changePenSize(10)}>Small</button>
            <button onClick={() => changePenSize(30)}>Medium</button>
            <button onClick={() => changePenSize(50)}>Large</button>
          </div>
          <div className="pen-eraser-options">
            <button onClick={initErasing}>ERASER</button>
            <button onClick={() => changeEraserSize(10)}>Small</button>
            <button onClick={() => changeEraserSize(30)}>Medium</button>
            <button onClick={() => changeEraserSize(50)}>Large</button>
          </div>
        </div>
        <div id="undo-redo-btns">
          <div id="undo-redo-btns">
            <button onClick={undoLast}>UNDO</button>
            <button onClick={redoLast}>REDO</button>
            <button onClick={helper}>helper</button>
            <button onClick={reDrawCanvas}>REDRAW</button>
          </div>
        </div>
        <button onClick={clearCanvas}>CLEAR</button>
      </div>
    </div>
  );
};
export default Whiteboard;
