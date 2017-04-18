
var dt = 30e-3;
var playing = false;


window.onload = function(){
    var pelota1 = {}
	var time = 0

    // Position Plot
	var pos_plot = document.querySelector("#position-plot")
	var pos_data = []
	var pos_graph = initializePositionPlot(pos_plot, pos_data)
    // Speed Plot
	var speed_plot = document.querySelector("#speed-plot")
	var speed_data = []
	var speed_graph = initializeSpeedPlot(speed_plot, speed_data)
    // Accel Plot
	var accel_plot = document.querySelector("#accel-plot")
	var accel_data = []
    var accel_graph = initializeAccelPlot(accel_plot, accel_data)

    // Code editor
	var editor = ace.edit("editor")
    editor.on('change', stopSim)
    setUpGUI()
    // User defined functions will be stored here so they're available in this scope
    var updatePosition
    var initialize

	function togglePlayPauseSim(){
		if(playing = !playing){
            // Starting (after Stop press)
            if (!time){
                if (!loadUserCode()){
                    playing = false
                }
            }
            // Start the main loop
			updateSimulator()
		}
        updateButtons()
	}
	
	function stopSim(){
        if(time == 0)
            return
		time = 0
        // Clear position data points
        pos_data.length = 0
        speed_data.length = 0
        accel_data.length = 0
		playing = false
        pelota1.x = 0
        pelota1.y = 0
        updateButtons()
        initialize()  // Run user code to set the initial object position
        placeObjectsInPosition()
        updatePlots()
	}

    function loadUserCode(){
        try{
            var actualizar = null
            var iniciar = null
            eval(editor.getValue())
            if ((typeof actualizar !== 'function') || (typeof iniciar !== 'function')){
                throw 'Debes definir las funciones "iniciar" y "actualizar"'
            }
        }
        catch(error){
            msg = "El código tiene algún error: " + (typeof error === 'string')?error:error.message
            alert(msg)
            console.log(msg)
            return false
        }
        // Run inicializer user function
        iniciar()
        // Store user functions in those pointers so they're available in a broader scope
        updatePosition = actualizar
        initialize = iniciar
        return true
    }

	function updateSimulator(){
		// Loop this function while playing
		if (playing){
            time += dt
            // Execute user defined function to calculate position
            updatePosition()
            placeObjectsInPosition()
            updatePlots()
            // Loop this function
			setTimeout(updateSimulator, 1000*dt)
		}
	}

    function updatePlots(){
		// Position plot update
		pos_data.push({x: time, y: pelota1.x})
		if (pos_data.length >= 10/dt){ // limit to 10 secs the x axe
		 	pos_data.shift()
		}
		pos_graph.update()
		// Speed plot update
        if(pos_data.length > 1){
            speed = (pos_data[pos_data.length - 1].y - pos_data[pos_data.length - 2].y)/dt
            speed_data.push({x: time, y: speed})
            if (speed_data.length >= 10/dt){ // limit to 10 secs the x axe
                speed_data.shift()
            }
        }
        speed_graph.update()
		// Accel plot update
        if(speed_data.length > 1){
            accel = (speed_data[speed_data.length - 1].y - speed_data[speed_data.length - 2].y)/dt
            accel_data.push({x: time, y: accel})
            if (accel_data.length >= 10/dt){ // limit to 10 secs the x axe
                accel_data.shift()
            }
        }
        accel_graph.update()
    }

    function placeObjectsInPosition(){
        if (Number(pelota1.x) !== pelota1.x || Number(pelota1.y) !== pelota1.y){
            throw 'Las variables pelota1.x y pelota1.y no son números, verifica el código'
        }
        document.getElementById("pelota").setAttribute("cx", pelota1.x);
        document.getElementById("pelota").setAttribute("cy", pelota1.y);
    }

    function setUpGUI(){
        document.getElementById("btn-play-pause").addEventListener("click", togglePlayPauseSim)
        document.getElementById("btn-stop").addEventListener("click", stopSim)
        editor.setTheme("ace/theme/monokai");
        editor.getSession().setMode("ace/mode/javascript");
    }

    function updateButtons(){
        document.getElementById("btn-play-pause").innerHTML = playing?"Pause":"Play"
    }
}

function initializePositionPlot(pos_element, pos_data){
	var graph = new Rickshaw.Graph( {
		element: pos_element, 
		renderer: 'line',
		width: pos_element.offsetWidth, 
		height: pos_element.offsetHeight, 
		series: [{
			color: 'steelblue',
			data: pos_data,
			name: 'Posición'
		}]
	})
	 
	// Point viewer
	 var hoverDetail = new Rickshaw.Graph.HoverDetail( {
		graph: graph,
		xFormatter: function(x) { return x + " s" },
		yFormatter: function(y) { return Math.floor(y) + " pixeles" }
	} )
	
	// X-Axis
	var time = new Rickshaw.Fixtures.Time();
	var xAxis = new Rickshaw.Graph.Axis.Time({
		graph: graph,
		timeUnit: time.unit('second')
	});
	xAxis.render()
	// Y-Axis
	var yAxis = new Rickshaw.Graph.Axis.Y({
    	graph: graph,
        ticks: 5
	});
	yAxis.render()
	graph.render()
    return graph
}

function initializeSpeedPlot(speed_element, speed_data){
	var graph = new Rickshaw.Graph( {
		element: speed_element, 
		renderer: 'line',
		width: speed_element.offsetWidth, 
		height: speed_element.offsetHeight, 
        min: 'auto',
		series: [{
			color: 'steelblue',
			data: speed_data,
			name: 'Velocidad'
		}]
	})
	 
	// Point viewer
	 var hoverDetail = new Rickshaw.Graph.HoverDetail( {
		graph: graph,
		xFormatter: function(x) { return x + " s" },
		yFormatter: function(y) { return Math.floor(y) + " pixeles/segundo" }
	} )
	
	// X-Axis
	var time = new Rickshaw.Fixtures.Time();
	var xAxis = new Rickshaw.Graph.Axis.Time({
		graph: graph,
		timeUnit: time.unit('second')
	});
	xAxis.render()
	// Y-Axis
	var yAxis = new Rickshaw.Graph.Axis.Y({
    	graph: graph,
        ticks: 5
	});
	yAxis.render()
	graph.render()
    return graph
}

function initializeAccelPlot(accel_element, accel_data){
	var graph = new Rickshaw.Graph( {
		element: accel_element, 
		renderer: 'line',
		width: accel_element.offsetWidth, 
		height: accel_element.offsetHeight, 
        min: 'auto',
		series: [{
			color: 'steelblue',
			data: accel_data,
			name: 'Aceleración',
		}]
	})
	 
	// Point viewer
	 var hoverDetail = new Rickshaw.Graph.HoverDetail( {
		graph: graph,
		xFormatter: function(x) { return x + " s" },
		yFormatter: function(y) { return Math.floor(y) + " pixeles/segundo^2" }
	} )
	
	// X-Axis
	var time = new Rickshaw.Fixtures.Time();
	var xAxis = new Rickshaw.Graph.Axis.Time({
		graph: graph,
		timeUnit: time.unit('second')
	});
	xAxis.render()
	// Y-Axis
	var yAxis = new Rickshaw.Graph.Axis.Y({
    	graph: graph,
        ticks: 5
	});
	yAxis.render()
	graph.render()
    return graph
}

