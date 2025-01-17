window.onload = function () {
    var myCanvas = document.getElementById('jsCanvas');
    var ctx = myCanvas.getContext('2d');

    myCanvas.width = 1200;
    myCanvas.height = 500;

    ctx.lineWidth = 2.5;

    let painting = false;
    let isSpoidMode = false;
    let isTextMode = false;
    let isTextTransformer = true;
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

    function addInput(event) {
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
        }

        // 새로운 텍스트 노드 생성
        var newTextNode = new Konva.Text({
            text: 'Some text here',
            x: event.offsetX,
            y: event.offsetY,
            fontSize: 20,
            draggable: true,
            width: 200,
        });

        layer.add(newTextNode);

        // 새로운 transformer 생성
        var newTr = new Konva.Transformer({
            node: newTextNode,
            enabledAnchors: ['middle-left', 'middle-right'],
            boundBoxFunc: function (oldBox, newBox) {
                newBox.width = Math.max(30, newBox.width);
                return newBox;
            },
        });

        layer.add(newTr);

        // 배열에 추가
        textNodes.push(newTextNode);
        transformers.push(newTr);

        // 텍스트 변환 이벤트
        newTextNode.on('transform', function () {
            this.setAttrs({
                width: this.width() * this.scaleX(),
                scaleX: 1,
            });
        });

        // transformer 함수 호출 (텍스트 편집 기능)
        transformer(newTextNode, newTr, stage);

        layer.batchDraw();

    }

    function transformer(textNode, tr, stage) {  
        textNode.on('dblclick dbltap', () => {
          // hide text node and transformer:
          textNode.hide();
          tr.hide();
  
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
            tr.show();
            tr.forceUpdate();
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
    


    document.addEventListener('click', function (event) {
        console.log(isTextTransformer, ': isTextTransformer')
        const colorElement = event.target.closest('.controls__color');
        const backgroundColorPicker = document.getElementById('backgroundColorPicker');


        if(isTextMode) {
            isTextTransformer = !isTextTransformer;

            if(isTextTransformer) {
                transformers.forEach(tr => tr.hide());
            } else {
                addInput(event);
            }
        }

        switch(event.target.id) {
            case 'controls__color' :
                    if (colorElement) {
                        const color = colorElement.dataset.color;
            
                        if(color) {
                            console.log(color, ':: color')

                            //색 설정 바꾸기
                            backgroundColorPicker.value = color;


                            //색 바꾸기&드레그 드로잉 출력
                            ctx.strokeStyle = color;
                            initCanvasListeners();
                        }
                    }
                break;
            case 'eraseButton':
                    removeCanvasListeners();
                    ctx.globalCompositeOperation = "destination-out";  
                    ctx.strokeStyle = "#FFFFFF";
                    initCanvasListeners();
                break;
            case 'fillSytleButton':
                    ctx.fillStyle = backgroundColorPicker.value;
                    ctx.fillRect(0,0,1200,500);
                break;
            case 'spoidButton':
                    isSpoidMode = true;  // 스포이드 모드 활성화
                    removeCanvasListeners();  // 그리기 이벤트 제거

                break;
            case 'pencilButton':
            case 'backgroundColorPicker':
                    backgroundColorPicker.addEventListener('change', function(event){
                        ctx.strokeStyle = event.target.value;
                        console.log(event.target.value,':changeColorPicker change');
                    })

                    ctx.strokeStyle = backgroundColorPicker.value;
                    initCanvasListeners();
                break;
            case 'textButton':
                isTextMode = true;
                break;
        } 
        
    });


    // 캔버스 내에서 클릭 시
    myCanvas.addEventListener('click', function(event) {
            if (isSpoidMode) {
                const x = event.offsetX;
                const y = event.offsetY;
                
                try {
                    const pixelData = ctx.getImageData(x, y, 1, 1).data;
                    const hex = "#" + ("000000" + rgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-6);
                    console.log(hex, ':hex');
                    backgroundColorPicker.value = hex;
                    
                    // 색상 선택 후 스포이드 모드 해제
                    isSpoidMode = false;
                    ctx.strokeStyle = hex;
                    initCanvasListeners();
                } catch(error) {
                    console.error('색상을 가져오는데 실패했습니다:', error);
                }
            } else if (isTextMode && isTextTransformer) {
                addInput(event);
            }
    });



}
