window.onload = function () {
  var myCanvas = document.getElementById('jsCanvas');
  var ctx = myCanvas.getContext('2d');

  myCanvas.width = 1200;
  myCanvas.height = 500;

  ctx.lineWidth = 2.5;

  let painting = false;
  // let isSpoidMode = false;
  let Mode = 'pencilMode';
  let hideTextTransformer = false;
  const font = '14px sans-serif';

  function removeCanvasListeners() {
      myCanvas.removeEventListener("mousemove", onMouseMove);
      myCanvas.removeEventListener("mousedown", onMouseDown);
      myCanvas.removeEventListener("mouseup", stopPainting);
      myCanvas.removeEventListener("mouseleave", stopPainting);
  }

  function initCanvasListeners() {
      // 지우개 리셋..
      ctx.globalCompositeOperation = "source-over";

      myCanvas.addEventListener("mousemove", onMouseMove);
      myCanvas.addEventListener("mousedown", onMouseDown);
      myCanvas.addEventListener("mouseup", stopPainting);
      myCanvas.addEventListener("mouseleave", stopPainting);
  }

  function onMouseMove(event) {
      const x = event.offsetX;
      const y = event.offsetY;
      if(!painting) {
          ctx.beginPath();
          ctx.moveTo(x,y)
      } else {
          ctx.lineTo(x,y);
          ctx.stroke();
      }

  }

  function onMouseDown() {
      painting = true;
  }

  function stopPainting() {
      painting = false;
  }

  // RGB를 16진수로 변환하는 헬퍼 함수
  function rgbToHex(r, g, b) {
      if (r > 255 || g > 255 || b > 255)
          throw "Invalid color component";
      return ((r << 16) | (g << 8) | b).toString(16);
  }

  let textNodes = [];
  let transformers = [];
  let stage = null;
  let layer = null;
  var tr = null;
  
  const canvas = document.getElementById('jsCanvas');
  const container = document.getElementById('container');

  // stage가 없을 때만 새로 생성
  if (!stage) {
    const konvaContainer = document.createElement('div');
    konvaContainer.id = 'konvaContainer';
    konvaContainer.style.position = 'absolute';
    konvaContainer.style.top = canvas.offsetTop + 'px';
    konvaContainer.style.left = canvas.offsetLeft + 'px';
    konvaContainer.style.width = canvas.width + 'px';
    konvaContainer.style.height = canvas.height + 'px';
    container.appendChild(konvaContainer);

    stage = new Konva.Stage({
        container: 'konvaContainer',
        width: 1200,
        height: 500,
    });

    layer = new Konva.Layer();
    stage.add(layer);

    // konvaContainer.style.pointerEvents = 'none';
}

function togglePointerEvents(mode) {
  console.log(mode, ':: mode')
  const konvaContainer = document.getElementById('konvaContainer');
  if (mode === 'textMode' || mode === 'circle') {
      konvaContainer.style.pointerEvents = 'auto';  // 텍스트 모드일 때는 활성화
  } else {
      konvaContainer.style.pointerEvents = 'none';  // 다른 모드일 때는 비활성화
  }
}
  function addInput(event) {
      
    var newTextNode = new Konva.Text({
      x: event.offsetX,
      y: event.offsetY,
      fontSize: 30,
      text: '텍스트를 입력하세요.',
      draggable: true,
    });
    layer.add(newTextNode);


    // 배열에 추가
    textNodes.push(newTextNode);

    // transformer 함수 호출 (텍스트 편집 기능)
    transformer(newTextNode, stage);

    layer.batchDraw();

  }

  function transformer(textNode, stage) {  

      var newTr = new Konva.Transformer({
        nodes: [textNode],
        centeredScaling: true,
      });
      layer.add(newTr);

      transformers.push(newTr);

      // 텍스트 변환 이벤트
        textNode.on('transform', function () {
          this.setAttrs({
              width: this.width() * this.scaleX(),
              scaleX: 1,
          });
      });

    //     // 텍스트 클릭 이벤트 추가
    //   textNode.on('click', function() {
    //     // 모든 transformer 숨기기
    //     transformers.forEach(tr => tr.hide());
    //     // 현재 텍스트의 transformer만 보이기
    //     newTr.show();
    //     layer.batchDraw();
    // });

      textNode.on('dblclick dbltap', () => {
        // hide text node and transformer:
        textNode.hide();
        newTr.hide();

        // create textarea over canvas with absolute position
        // first we need to find position for textarea
        // how to find it?

        // at first lets find position of text node relative to the stage:
        var textPosition = textNode.absolutePosition();

        // so position of textarea will be the sum of positions above:
        var areaPosition = {
          x: stage.container().offsetLeft + textPosition.x,
          y: stage.container().offsetTop + textPosition.y,
        };

        // create textarea and style it
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        // apply many styles to match text on canvas as close as possible
        // remember that text rendering on canvas and on the textarea can be different
        // and sometimes it is hard to make it 100% the same. But we will try...
        textarea.value = textNode.text();
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
        textarea.style.height =
          textNode.height() - textNode.padding() * 2 + 5 + 'px';
        textarea.style.fontSize = textNode.fontSize() + 'px';
        textarea.style.border = 'none';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = textNode.lineHeight();
        textarea.style.fontFamily = textNode.fontFamily();
        textarea.style.transformOrigin = 'left top';
        textarea.style.textAlign = textNode.align();
        textarea.style.color = textNode.fill();
        rotation = textNode.rotation();
        var transform = '';
        if (rotation) {
          transform += 'rotateZ(' + rotation + 'deg)';
        }

        var px = 0;
        // also we need to slightly move textarea on firefox
        // because it jumps a bit
        var isFirefox =
          navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isFirefox) {
          px += 2 + Math.round(textNode.fontSize() / 20);
        }
        transform += 'translateY(-' + px + 'px)';

        textarea.style.transform = transform;

        // reset height
        textarea.style.height = 'auto';
        // after browsers resized it we can set actual value
        textarea.style.height = textarea.scrollHeight + 3 + 'px';

        textarea.focus();

        function removeTextarea() {
          textarea.parentNode.removeChild(textarea);
          window.removeEventListener('click', handleOutsideClick);
          textNode.show();
          newTr.show();
          newTr.forceUpdate();
        }

        function setTextareaWidth(newWidth) {
          if (!newWidth) {
            // set width for placeholder
            newWidth = textNode.placeholder.length * textNode.fontSize();
          }
          // some extra fixes on different browsers
          var isSafari = /^((?!chrome|android).)*safari/i.test(
            navigator.userAgent
          );
          var isFirefox =
            navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
          if (isSafari || isFirefox) {
            newWidth = Math.ceil(newWidth);
          }

          var isEdge =
            document.documentMode || /Edge/.test(navigator.userAgent);
          if (isEdge) {
            newWidth += 1;
          }
          textarea.style.width = newWidth + 'px';
        }

        textarea.addEventListener('keydown', function (e) {
          // hide on enter
          // but don't hide on shift + enter
          if (e.keyCode === 13 && !e.shiftKey) {
            textNode.text(textarea.value);
            removeTextarea();
          }
          // on esc do not set value back to node
          if (e.keyCode === 27) {
            removeTextarea();
          }
        });

        textarea.addEventListener('keydown', function (e) {
          scale = textNode.getAbsoluteScale().x;
          setTextareaWidth(textNode.width() * scale);
          textarea.style.height = 'auto';
          textarea.style.height =
            textarea.scrollHeight + textNode.fontSize() + 'px';
        });

        function handleOutsideClick(e) {
          if (e.target !== textarea) {
            textNode.text(textarea.value);
            removeTextarea();
          }
        }
        setTimeout(() => {
          window.addEventListener('click', handleOutsideClick);
        });
      });
  }

let box = null; 

// 초기 box 생성 함수
function createBox(x = 0, y = 0) {
  box = new Konva.Rect({
      x: x,
      y: y,
      stroke: 'black',
      strokeWidth: 2,
      draggable: true,
      width: 400,
      height: 300,
  });
  layer.add(box);
  layer.batchDraw();
}

function cursorMouseenter() {
      if (!box) {
          createBox();
      }
}

function cursorMouseleave() {
      if (box) {
        box.destroy();
        box = null;
        layer.batchDraw();
    }
}

function cursorMousemove(e) {
  if (!box) return;

  let mouseX = e.offsetX;
  let mouseY = e.offsetY;

  // Rect 위치 업데이트
  box.position({
      x: mouseX - 200,
      y: mouseY -150
  });
  layer.batchDraw();
}

function makeCursor() {
  // 함수 호출 시 바로 box 생성
  createBox();

  myCanvas.addEventListener("mouseenter", cursorMouseenter);
  myCanvas.addEventListener("mouseleave", cursorMouseleave);
  myCanvas.addEventListener("mousemove", cursorMousemove);
}

function destroyMakeCursor() {  
myCanvas.removeEventListener("mouseenter", cursorMouseenter);
myCanvas.removeEventListener("mouseleave", cursorMouseleave);
myCanvas.removeEventListener("mousemove", cursorMousemove);
}

let isShape = false;
let circle = null;

function makeCircle() {
circle = new Konva.Circle({
  fill: 'rgba(0, 0, 255, 0.5)', 
  radius: 20,
  stroke: 'black',
  strokeWidth: 4,
  draggable: true
});

layer.add(circle);
layer.batchDraw();
}

function makeCompletedCircle() {
circle = new Konva.Circle({
  // fill: 'red',
  radius: 20,
  stroke: 'red',
  strokeWidth: 4,
  draggable: true
});

// Transformer 추가
const tr = new Konva.Transformer({
  nodes: [circle],
  keepRatio: true,
  enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
});

layer.add(circle);
layer.add(tr);
layer.batchDraw();
}

  document.addEventListener('click', function (event) {
      const colorElement = event.target.closest('.controls__color');
      const backgroundColorPicker = document.getElementById('backgroundColorPicker');
      switch(event.target.id) {
          case 'pencilButton':
          case 'controls__color' :
                    Mode = 'pencilMode';
                    togglePointerEvents(Mode);
                  if (colorElement) {
                      const color = colorElement.dataset.color;
          
                      if(color) {
                          console.log(color, ':: color')

                          //색 설정 바꾸기
                          backgroundColorPicker.value = color;


                          //색 바꾸기&드레그 드로잉 출력
                          ctx.strokeStyle = color;
                        }
                      }
                      ctx.strokeStyle = backgroundColorPicker.value;
                      initCanvasListeners();
                      destroyMakeCursor();
              break;
          case 'eraseButton':
                  Mode = 'eraselMode';
                  ctx.globalCompositeOperation = "destination-out";  
                  ctx.strokeStyle = "#FFFFFF";
                  removeCanvasListeners();
                  initCanvasListeners();
                  destroyMakeCursor();
              break;
          case 'fillSytleButton':
                  ctx.fillStyle = backgroundColorPicker.value;
                  ctx.fillRect(0,0,1200,500);
              break;
          case 'spoidButton':
                  Mode = 'isSpoidMode';  // 스포이드 모드 활성화
                  togglePointerEvents(Mode);
                  removeCanvasListeners();  // 그리기 이벤트 제거
                  destroyMakeCursor();
              break;
          case 'backgroundColorPicker':
                  backgroundColorPicker.addEventListener('change', function(event){
                      ctx.strokeStyle = event.target.value;
                      console.log(event.target.value,':changeColorPicker change');
                  })

                  ctx.strokeStyle = backgroundColorPicker.value;
                  initCanvasListeners();
              break;
          case 'textButton':
                  Mode = 'textMode';
                  togglePointerEvents(Mode);
                  removeCanvasListeners();
                  destroyMakeCursor();
                  hideTextTransformer = true; // 텍스트 모드 시작시 초기화

                     //Konva canvas내 클릭시
                  stage.on('click', (e) => {
                    const pos = stage.getPointerPosition();
                    const shape = stage.getIntersection(pos);
                        if (hideTextTransformer) {
                            if (!shape || !(shape instanceof Konva.Text)) {
                                // stage의 좌표를 event 좌표로 변환
                                const evt = {
                                    offsetX: pos.x,
                                    offsetY: pos.y
                                };
                                addInput(evt);
                            } else {
                                const tr = transformers[textNodes.indexOf(shape)];
                                if (tr) {
                                    tr.show();
                                    layer.batchDraw();
                                }
                            }
                            hideTextTransformer = false;
                        } else if (!hideTextTransformer) {
                            layer.find('Transformer').forEach((tr) => {
                                tr.hide();
                            });
                            layer.batchDraw();
                            hideTextTransformer = true;
                        }
                });


                  break;
          case 'magnifierButton':
            Mode = 'MagnifierMode';
            togglePointerEvents(Mode);
                  makeCursor();
                  removeCanvasListeners();
                  break;
          case 'circleButton':
            Mode = 'circle';
            togglePointerEvents(Mode); 
            removeCanvasListeners();
            let startPos = null;
            let currentCircle = null;
            let isMouseDown = false;
            
            stage.on('mousedown', (e) => {
              if (Mode !== 'circle') return;
              console.log('mousedown')
              startPos = stage.getPointerPosition();
              isShape = true;
              isMouseDown = true;
             });

             stage.on('mouseup', () => {
              console.log('mouseup')
              isMouseDown = false;

              if (Mode !== 'circle' || !currentCircle) return;
                // 임시 원 삭제
                currentCircle.destroy();
                
                // 완성된 원 생성
                makeCompletedCircle();
                circle.position(currentCircle.position());
                circle.radius(currentCircle.radius());

                isShape = false;
                currentCircle = null;
                layer.batchDraw();
                
            });
             
             stage.on('mousemove', (e) => {
              if (!isShape || Mode !== 'circle' || !isMouseDown) return;
              console.log('mousedown')
              
              const pos = stage.getPointerPosition();
              if (!currentCircle && (pos.x !== startPos.x || pos.y !== startPos.y)) {
                makeCircle();
                currentCircle = circle;
                currentCircle.position(startPos);
                currentCircle.radius(1); 
              }
             
              if (currentCircle) {
                const dx = pos.x - startPos.x;
                const dy = pos.y - startPos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                currentCircle.position({
                  x: startPos.x + dx/2,
                  y: startPos.y + dy/2
                });
                currentCircle.radius(distance/2);
                layer.batchDraw();
              }
             });
            

            break;
      } 
      
  });


  // 캔버스 내에서 클릭 시
  myCanvas.addEventListener('click', function(event) {
    console.log(Mode, ':::: Mode canvas')

          switch(Mode) {
            case 'isSpoidMode' :
              const x = event.offsetX;
              const y = event.offsetY;
              
              try {
                  const pixelData = ctx.getImageData(x, y, 1, 1).data;
                  const hex = "#" + ("000000" + rgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-6);
                  console.log(hex, ':hex');
                  backgroundColorPicker.value = hex;
                  
                  // 색상 선택 후 스포이드 모드 해제
                  Mode = 'pencilMode';
                  ctx.strokeStyle = hex;
                  initCanvasListeners();
              } catch(error) {
                  console.error('색상을 가져오는데 실패했습니다:', error);
              }
              break;
            
            case 'MagnifierMode' :
              const scale = 2; // 고정 확대 비율
              const mousePosX = event.clientX - canvas.getBoundingClientRect().left;
              const mousePosY = event.clientY - canvas.getBoundingClientRect().top;
      
              // 현재 캔버스 내용을 임시 캔버스에 저장
              const tempCanvas = document.createElement('canvas');
              const tempCtx = tempCanvas.getContext('2d');
              tempCanvas.width = myCanvas.width;
              tempCanvas.height = myCanvas.height;
              tempCtx.drawImage(myCanvas, 0, 0);
      
              // 메인 캔버스 클리어
              ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
      
              // 변환 적용
              ctx.save();
              
              // 마우스 위치를 중심으로 확대
              ctx.translate(mousePosX, mousePosY);
              ctx.scale(scale, scale);
              ctx.translate(-mousePosX, -mousePosY);
              
              // 저장해둔 이미지 그리기
              ctx.drawImage(tempCanvas, 0, 0);
              
              ctx.restore();
              break;

            case 'circle':
              
              console.log('!!!!!!!!!!')
              break;
          }
  });



}
