window.onload = function () {
    var myCanvas = document.getElementById('jsCanvas');
    var ctx = myCanvas.getContext('2d');

    myCanvas.width = 1200;
    myCanvas.height = 500;

    ctx.lineWidth = 2.5;

    let painting = false;
    let isSpoidMode = false;
    let isTextMode = false;
    let canCreateNewText = false;
    let isEditingText = false;  
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
        // 컨테이너 생성
        const container = document.createElement('div');
        container.className = 'resizable draggable';
        container.style.position = 'absolute';
        container.style.left = x + 'px';
        container.style.top = y + 'px';
        container.style.cursor = 'move';
        container.style.border = '1px dashed #000000';
        container.style.minHeight = '50px';
        container.style.minWidth = '100px';
    
        // 텍스트 영역 생성
        const textArea = document.createElement('div');
        textArea.contentEditable = 'true';
        textArea.innerHTML = 'Text here';
        textArea.style.width = '100%';
        textArea.style.height = '100%';
        textArea.style.position = 'absolute';
        textArea.style.boxSizing = 'border-box';
        container.appendChild(textArea);
    
        // 리사이즈 핸들 생성
        const positions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
        positions.forEach(pos => {
            const handle = document.createElement('div');
            handle.className = `ui-resizable-handle ui-resizable-${pos}`;
            handle.style.position = 'absolute';
            handle.style.width = '10px';
            handle.style.height = '10px';
            handle.style.backgroundColor = '#ffffff';
            handle.style.border = '1px solid #000000';
    
            // 핸들 위치 설정
            switch(pos) {
                case 'nw':
                    handle.style.left = '-5px';
                    handle.style.top = '-5px';
                    handle.style.cursor = 'nw-resize';
                    break;
                case 'ne':
                    handle.style.right = '-5px';
                    handle.style.top = '-5px';
                    handle.style.cursor = 'ne-resize';
                    break;
                case 'sw':
                    handle.style.left = '-5px';
                    handle.style.bottom = '-5px';
                    handle.style.cursor = 'sw-resize';
                    break;
                case 'se':
                    handle.style.right = '-5px';
                    handle.style.bottom = '-5px';
                    handle.style.cursor = 'se-resize';
                    break;
                case 'n':
                    handle.style.left = '50%';
                    handle.style.top = '-5px';
                    handle.style.cursor = 'n-resize';
                    break;
                case 's':
                    handle.style.left = '50%';
                    handle.style.bottom = '-5px';
                    handle.style.cursor = 's-resize';
                    break;
                case 'e':
                    handle.style.right = '-5px';
                    handle.style.top = 'calc(50% - 5px)';
                    handle.style.cursor = 'e-resize';
                    break;
                case 'w':
                    handle.style.left = '-5px';
                    handle.style.top = 'calc(50% - 5px)';
                    handle.style.cursor = 'w-resize';
                    break;
            }
            container.appendChild(handle);
        });
    
        // 드래그 기능 구현
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
    
        container.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    
        function dragStart(e) {
            if (e.target === textArea) return;
            
            initialX = e.clientX - container.offsetLeft;
            initialY = e.clientY - container.offsetTop;
            
            isDragging = true;
        }
    
        function drag(e) {
            if (!isDragging) return;
    
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
    
            container.style.left = currentX + 'px';
            container.style.top = currentY + 'px';
        }
    
        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }
    
        // 리사이즈 기능 구현
        let isResizing = false;
        let currentHandle = null;
        let originalWidth;
        let originalHeight;
        let originalX;
        let originalY;
        let originalMouseX;
        let originalMouseY;
    
        const handles = container.querySelectorAll('.ui-resizable-handle');
        handles.forEach(handle => {
            handle.addEventListener('mousedown', resizeStart);
        });
    
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', resizeEnd);
    
        function resizeStart(e) {
            isResizing = true;
            currentHandle = e.target;
            
            originalWidth = container.offsetWidth;
            originalHeight = container.offsetHeight;
            originalX = container.offsetLeft;
            originalY = container.offsetTop;
            originalMouseX = e.clientX;
            originalMouseY = e.clientY;
    
            e.stopPropagation();
        }
    
        function resize(e) {
            if (!isResizing) return;
    
            const dx = e.clientX - originalMouseX;
            const dy = e.clientY - originalMouseY;
            
            if (currentHandle.classList.contains('ui-resizable-se')) {
                container.style.width = originalWidth + dx + 'px';
                container.style.height = originalHeight + dy + 'px';
            } else if (currentHandle.classList.contains('ui-resizable-sw')) {
                container.style.width = originalWidth - dx + 'px';
                container.style.height = originalHeight + dy + 'px';
                container.style.left = originalX + dx + 'px';
            } else if (currentHandle.classList.contains('ui-resizable-ne')) {
                container.style.width = originalWidth + dx + 'px';
                container.style.height = originalHeight - dy + 'px';
                container.style.top = originalY + dy + 'px';
            } else if (currentHandle.classList.contains('ui-resizable-nw')) {
                container.style.width = originalWidth - dx + 'px';
                container.style.height = originalHeight - dy + 'px';
                container.style.top = originalY + dy + 'px';
                container.style.left = originalX + dx + 'px';
            } else if (currentHandle.classList.contains('ui-resizable-n')) {
                container.style.height = originalHeight - dy + 'px';
                container.style.top = originalY + dy + 'px';
            } else if (currentHandle.classList.contains('ui-resizable-s')) {
                container.style.height = originalHeight + dy + 'px';
            } else if (currentHandle.classList.contains('ui-resizable-e')) {
                container.style.width = originalWidth + dx + 'px';
            } else if (currentHandle.classList.contains('ui-resizable-w')) {
                container.style.width = originalWidth - dx + 'px';
                container.style.left = originalX + dx + 'px';
            }
        }
    
        function resizeEnd() {
            isResizing = false;
            currentHandle = null;
        }
    
        // 텍스트 편집 기능
        textArea.addEventListener('click', function(e) {
            e.stopPropagation();
            isEditingText = true;  // 편집 모드 활성화
            isTextMode = false;    // 새 텍스트 생성 모드 비활성화
            canCreateNewText = false;

            // 다른 모든 텍스트 상자들의 편집 모드와 테두리 해제
            const allTextBoxes = document.querySelectorAll('.resizable.draggable');
            allTextBoxes.forEach(box => {
                if (box !== this.parentElement) {
                    const otherTextArea = box.querySelector('[contenteditable]');
                    if (otherTextArea) {
                        otherTextArea.contentEditable = 'false';
                        otherTextArea.style.cursor = 'move';
                        box.style.cursor = 'move';
                        box.style.border = 'none';
                        
                        const handles = box.querySelectorAll('.ui-resizable-handle');
                        handles.forEach(handle => {
                            handle.style.display = 'none';
                        });
                    }
                }
            });

            // 현재 텍스트 상자 활성화
            this.contentEditable = 'true';
            this.style.cursor = 'text';
            container.style.cursor = 'text';
            container.style.border = '1px dashed #000000';
            
            const handles = container.querySelectorAll('.ui-resizable-handle');
            handles.forEach(handle => {
                handle.style.display = 'block';
            });
        });
    
        textArea.addEventListener('blur', function() {
            this.contentEditable = 'false';
            this.style.cursor = 'move';
            container.style.cursor = 'move';
        });
    
        // 텍스트 내용이 변경될 때마다 크기 조절
        let observer = new MutationObserver(function(mutations) {
            // 컨테이너 크기를 텍스트 영역에 맞게 조절
            container.style.width = textArea.scrollWidth + 'px';
            container.style.height = textArea.scrollHeight + 'px';
        });
    
        // 텍스트 영역의 변화 감지 설정
        observer.observe(textArea, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        });
    
        // 입력 이벤트에도 대응
        textArea.addEventListener('input', function() {
            container.style.width = textArea.scrollWidth + 'px';
            container.style.height = textArea.scrollHeight + 'px';
        });
    
        document.body.appendChild(container);
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
                isTextMode = !isTextMode;
                isEditingText = false;
                canCreateNewText = isTextMode; // isTextMode가 true면 canCreateNewText도 true로 설정
                break;
        } 
        
    });


    // 캔버스 내에서 클릭 시
    myCanvas.addEventListener('click', function(event) {

        const allTextBoxes = document.querySelectorAll('.resizable.draggable');
        allTextBoxes.forEach(box => {
            const textArea = box.querySelector('[contenteditable]');
            if (textArea) {
                textArea.contentEditable = 'false';
                textArea.style.cursor = 'move';
                box.style.cursor = 'move';
                box.style.border = 'none';
                
                const handles = box.querySelectorAll('.ui-resizable-handle');
                handles.forEach(handle => {
                    handle.style.display = 'none';
                });
            }
        });


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
            if (canCreateNewText) {  // 두 번째 클릭일 때
                console.log(event.clientX, event.clientY, ': event.client 11')
                addInput(event.clientX, event.clientY);
                canCreateNewText = false;  // 텍스트 생성 후 플래그 리셋
            } else {  // 첫 번째 클릭일 때
                canCreateNewText = true;  // 다음 클릭에서 새 텍스트 생성 가능하도록 설정
            }
        }
        isEditingText = false;  // 편집 모드 해제
    });



}
