window.onload = function () {
    var myCanvas = document.getElementById('jsCanvas');
    var ctx = myCanvas.getContext('2d');

    myCanvas.width = 1200;
    myCanvas.height = 500;

    ctx.lineWidth = 2.5;

    let painting = false;
    let isSpoidMode = false;
    let isTextMode = false;
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

    function addInput(x, y) {
        var input = document.createElement('input');

        input.type = 'text';
        input.style.position = 'fixed';
        input.style.left = x + 'px';
        input.style.top = y + 'px';

        // 클릭한 캔버스 좌표 저장
        input.canvasX = x - myCanvas.getBoundingClientRect().left;
        input.canvasY = y - myCanvas.getBoundingClientRect().top;

        input.onkeydown = handleEnter;

        document.body.appendChild(input);

        input.focus();

        isTextMode = true;
      }

    function handleEnter(e) {
        var keyCode = e.keyCode;
        if (keyCode === 13) {
            drawText(this.value, this.canvasX, this.canvasY);
          document.body.removeChild(this);
          isTextMode = false;
        }
      }

    function drawText(txt, x, y) {
        ctx.textBaseline = 'top';
        ctx.textAlign = 'left';
        ctx.font = font;
        ctx.fillStyle = "black";
        ctx.fillText(txt, x, y);
      }

    document.body.addEventListener('click', function (event) {
        console.log(event.target)
        const colorElement = event.target.closest('.controls__color');
        const backgroundColorPicker = document.getElementById('backgroundColorPicker');

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
        } else if (isTextMode) {
            console.log(event.clientX, event.clientY, ': event.client 11')
            addInput(event.clientX, event.clientY);
        }
    });



}
