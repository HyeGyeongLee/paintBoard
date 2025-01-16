window.onload = function () {
    var myCanvas = document.getElementById('jsCanvas');
    var ctx = myCanvas.getContext('2d');

    myCanvas.width = 1200;
    myCanvas.height = 500;

    ctx.lineWidth = 2.5;

    let painting = false;
    
    
    function removeCanvasListeners() {
        myCanvas.removeEventListener("mousemove", onMouseMove);
        myCanvas.removeEventListener("mousedown", onMouseDown);
        myCanvas.removeEventListener("mouseup", stopPainting);
        myCanvas.removeEventListener("mouseleave", stopPainting);
    }

    function initCanvasListeners() {
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

    document.body.addEventListener('click', function (event) {
        console.log(event.target)

        const colorElement = event.target.closest('.controls__color');

        switch(event.target.id) {
            case 'controls__color' :
                    if (colorElement) {
                        const color = colorElement.dataset.color;
            
                        if(color) {
                            ctx.strokeStyle = color;
                            initCanvasListeners();
                        }
                    }
                break;
            case 'erase':
                    removeCanvasListeners();
                    console.log('??')
                    ctx.globalCompositeOperation = "destination-out";  
                    ctx.strokeStyle = "#FFC300";
                    initCanvasListeners();
                break;

        }
        
        
    });


}
