// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------


let scene;
let camera;
let renderer;
let light;
let controls;



let facesArray = [];

let recursionLevel = 2;


let targetList = [];


let neig_info = {};

let distanceMult = 1.0001;

let maxRadius = 1.5;
let minRadius = 1;
let heightLevels = 3;
let current_level_height = 0.0;

let helper_size = 0.2


let gui = undefined;

let loaded_font = undefined

let dictionary_by_level = {}
let cells = [];


let modes = {
	none: "none",
	adding: "adding",
	removing: "removing",
	painting: "painting"
}

let descriptionForModes = {
	none: "Free exploration",
	adding: "Adding voxels",
	removing: "Removing voxels",
	painting: "Painting tool"
}

let current_mode = modes.none


let sphere_group = undefined;

let basic_icosphereGeometry = createIcosphereGeometry()


function basicSetup(){
	// Create an empty scene
	scene = new THREE.Scene();

	// Create a basic perspective camera
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
	camera.position.z = 6;

	let container = document.getElementById("canvas")


	// Create a renderer with Antialiasing
	renderer = new THREE.WebGLRenderer({antialias:true});

	// Configure renderer clear color
	renderer.setClearColor("#97a9c6");

	// Configure renderer size
	renderer.setSize( window.innerWidth, window.innerHeight );

	// Append Renderer to DOM
	//document.body.appendChild( renderer.domElement );
	container.appendChild(renderer.domElement);

   	light = new THREE.PointLight( 0xadadad, 1.5, 100 );
    
    light.position.set(0, 0, 10);
    scene.add(light);
    
 

    let ol = new THREE.PointLight( 0xadadad, 1.5, 100 );
    ol.position.set(0, 0, -10);
    scene.add(ol);
    


    let ol1 = new THREE.PointLight( 0xadadad, 1.5, 100 );
    ol1.position.set(10, 0, 0);
    scene.add(ol1);
    


	let ol2 = new THREE.PointLight( 0xadadad, 1.5, 100 );
    ol2.position.set(-10, 0, 0);
    scene.add(ol2);
    

    let ol3 = new THREE.PointLight( 0xadadad, 1.5, 100 );
    ol3.position.set(0, 5, 0);
    scene.add(ol3);
    


	let ol4 = new THREE.PointLight( 0xadadad, 1.5, 100 );
    ol4.position.set(0, -5, 0);
    scene.add(ol4);
    

    
	var pla = new THREE.PointLightHelper( light, 0.15, 0x1d0000);
	scene.add( pla );
	var plf = new THREE.PointLightHelper( ol4, 0.15, 0x1d0000 );
	scene.add( plf );
	var ple = new THREE.PointLightHelper( ol3, 0.15, 0x1d0000 );
	scene.add( ple );
	var pld = new THREE.PointLightHelper( ol2, 0.15, 0x1d0000 );
	scene.add( pld);
	var plc = new THREE.PointLightHelper( ol1, 0.15, 0x1d0000 );
	scene.add( plc );
	var plb = new THREE.PointLightHelper( ol, 0.15, 0x1d0000 );
	scene.add( plb );


	orbitcontrols = new THREE.OrbitControls( camera, renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );


	document.addEventListener('click', onDocumentMouseClick, false);

	var axesHelper = new THREE.AxesHelper( 5 );
	scene.add( axesHelper );

	
}

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}


function getCellForMesh(mesh){
	
	for(let i = 0; i < cells.length; i++){
		if(cells[i].element == mesh){
			return cells[i];
		}
	}
	return undefined
}
	//When the user clicks
function onDocumentMouseClick(event){

	event.stopPropagation();
	let x = ( event.clientX / window.innerWidth ) * 2 - 1;
	let y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	//console.log("click")
	var mouse = new THREE.Vector2( x, y);
	
	var ray = new THREE.Raycaster();

	ray.setFromCamera(mouse, camera);

	var intersects = ray.intersectObjects(targetList);


	switch(current_mode){
		case modes.removing:
			let toremove = undefined;

			if(intersects.length > 0){
				//console.log(intersects[0].face)
				toremove = intersects[0].object;
				sphere_group.remove(toremove)
			}

			if(toremove != undefined){
				let index = -1;

				for(let i =0; i < targetList.length; i++){
					if(targetList[i] == toremove){
						index = i;
						break
					}
				}

				targetList.splice(index, 1);
				index = -1;

				for(let i =0; i < cells.length; i++){
					if(cells[i].element == toremove){
						index = i;
						break
					}
				}
				cells.splice(index, 1);
			}
			
			break;
		
		case modes.adding:

			if(intersects.length > 0){
				//Get cell for this object
				let cell = getCellForMesh(intersects[0].object)
				console.log(cell, cell.element);

				console.log(basic_icosphereGeometry.geometry.vertices)
			}
			
			
			break;
		

		case modes.painting:
			if(intersects.length > 0){
				let cell = getCellForMesh(intersects[0].object)

				cell.changeType(gui_info.current_terrain)
			}


			break;


		default:
			break;
	}

	

}
	


function createIcosphereGeometry(){


	let result = {};

	let geom = new THREE.Geometry(); 



	
	let s = 1; //Basic radius is 1
	
	//Golden ratio
	let t = (1.0 + Math.sqrt(5.0)) / 2.0; //1.618

	let vertices = [];
	let faces = [];

	vertices.push(new THREE.Vector3(-s,t,0));
	vertices.push(new THREE.Vector3(s,t,0));
	vertices.push(new THREE.Vector3(-s,-t,0));
	vertices.push(new THREE.Vector3(s,-t,0));

	vertices.push(new THREE.Vector3(0, -s, -t));
	vertices.push(new THREE.Vector3(0, -s, t));
	vertices.push(new THREE.Vector3(0, s, t));
	vertices.push(new THREE.Vector3(0, s, -t));

	vertices.push(new THREE.Vector3(t, 0, -s));
	vertices.push(new THREE.Vector3(t, 0, s));
	vertices.push(new THREE.Vector3(-t, 0, s));
	vertices.push(new THREE.Vector3(-t, 0, -s));

	//Debug the original vertices
	/*let  textMaterial = new THREE.MeshLambertMaterial( { color: 0x000000 } );

	for(let i =0; i< vertices.length; i++){
		var tg = new THREE.TextGeometry( '' + i, {
			font: loaded_font,
			size:0.5,
			height: 0.001,
			curveSegments: 12
			
		} );

		let textmesh = new THREE.Mesh(tg, textMaterial)
		textmesh.position.x = vertices[i].x * 1.3
		textmesh.position.y = vertices[i].y * 1.3
		textmesh.position.z = vertices[i].z * 1.3

		scene.add(textmesh);
	}*/

	//TOP AROUND 0
	faces.push( new THREE.Face3( 0, 6, 1 ) );
	faces.push( new THREE.Face3( 0, 10, 6 ) );
	faces.push( new THREE.Face3( 0,11,10  ) );
	faces.push( new THREE.Face3( 0, 7, 11 ) );
	faces.push( new THREE.Face3( 0, 1, 7 ) );

	//BOTTOM AROUND 3
	faces.push( new THREE.Face3( 3, 8, 9 ) );
	faces.push( new THREE.Face3( 3, 4, 8 ) );
	faces.push( new THREE.Face3( 3,2 , 4 ) );
	faces.push( new THREE.Face3( 3, 5, 2 ) );
	faces.push( new THREE.Face3( 3,9,5) );

	faces.push( new THREE.Face3( 5, 6 , 10 ) );
	faces.push( new THREE.Face3( 5, 9,  6) );
	faces.push( new THREE.Face3( 9, 8,  1) );
	faces.push( new THREE.Face3( 9, 1, 6 ) );
	faces.push( new THREE.Face3( 8, 7,  1) );
	faces.push( new THREE.Face3( 8, 4, 7 ) );
	faces.push( new THREE.Face3( 4, 11, 7 ) );
	faces.push( new THREE.Face3( 4, 2,  11) );
	faces.push( new THREE.Face3( 2, 10, 11 ) );
	faces.push( new THREE.Face3( 2, 5,  10) );
	

	//Now, for each recursion level I will create new faces and vertices
	for(let i =0; i< recursionLevel; i++){

		let faces2 = [];
		let v2 = [];

		for(let ti = 0; ti < faces.length; ti++){
			let tri = faces[ti];

			let mab = getMiddlePoint(tri.a, tri.b, s, faces, vertices);
			let mbc = getMiddlePoint(tri.b, tri.c, s, faces, vertices);
			let mca = getMiddlePoint(tri.c, tri.a, s, faces, vertices);

			v2.push(getPointAtRadius(vertices[tri.a]));   
			v2.push(mab);    
			v2.push(mca);
			//faces2.push(new THREE.Face3(tri.a, mab, mca))

			faces2.push(new THREE.Face3( v2.length-3, v2.length-2, v2.length-1))

			v2.push(getPointAtRadius(vertices[tri.b]));    
			v2.push(mbc);    
			v2.push(mab);
			//faces2.push(new THREE.Face3(tri.b, mbc, mab))
			faces2.push(new THREE.Face3( v2.length-3, v2.length-2, v2.length-1))

			v2.push(getPointAtRadius(vertices[tri.c]));    
			v2.push(mca);	
			v2.push(mbc);
			//faces2.push(new THREE.Face3(tri.c, mca, mbc))

			faces2.push(new THREE.Face3( v2.length-3, v2.length-2, v2.length-1))

			v2.push(mab);
			v2.push(mbc);
			v2.push(mca);
			faces2.push(new THREE.Face3( v2.length-3, v2.length-2, v2.length-1))
			//faces2.push(new THREE.Face3(mab,mbc,mca))

			
		}

		faces = faces2;
		vertices = v2;
	}


	geom.vertices = vertices;
	geom.faces = faces;
	geom.computeFaceNormals();

	result.geometry = geom;


	//----- Testing the neighbours -----

	//Caché
	let dic = {}; //points


	for(let f of faces){

		let varr = []
		varr.push(vertices[f.a]); //index 0
		varr.push(vertices[f.b]); //index 1
		varr.push(vertices[f.c]); //index 2

		//For each vertice
		for(let v of varr){


			let vx = Math.round(v.x * 100) / 100;
			let vy = Math.round(v.y * 100) / 100;
			let vz = Math.round(v.z * 100) / 100;

			if(dic[vx] != undefined && dic[vx][vy] != undefined && dic[vx][vy][vz] != undefined){
				//match
				dic[vx][vy][vz].push(f);
			}else{
				if(dic[vx] == undefined){
					dic[vx] = {};
				}
				
				if(dic[vx][vy] == undefined){
					dic[vx][vy] = {}
				}
				
				if(dic[vx][vy][vz] == undefined){
					dic[vx][vy][vz] = [];
				}
				dic[vx][vy][vz].push(f);
			}

		}

	}
	result.neighbours_info = dic;


    

    
	return result;
}





//Returns a vector3
function getMiddlePoint(v1index, v2index, radius, faces, vertices){
	let p1 = vertices[v1index];
	let p2 = vertices[v2index];



	let x = (p1.x + p2.x) / 2;
	let y = (p1.y + p2.y) / 2;
	let z = (p1.z + p2.z) / 2;

	let p = new THREE.Vector3(x,y,z);

	let length = Math.sqrt(p.x * p.x + p.y*p.y + p.z * p.z)
	
	p.x = p.x / length;
	p.y = p.y / length;
	p.z = p.z / length;

	return p;

}

function getPointAtRadius(p){
	let length = Math.sqrt(p.x * p.x + p.y*p.y + p.z * p.z)
	
	let result = new THREE.Vector3(p.x,p.y,p.z);
	result.x = result.x / length;
	result.y = result.y / length;
	result.z = result.z / length;
	return result;
}


function addElementsToScene(){

	//let calculations =  createIcosphereGeometry();
	let calculations = basic_icosphereGeometry

	/*let geom = calculations.geometry;
	let mesh = new THREE.Mesh( geom,             new THREE.MeshLambertMaterial({
                color: 0x00afaf,
                side: THREE.DoubleSide
            })); 
	scene.add(mesh);

	targetList.push(mesh);*/


	console.log(calculations);



	neig_info = calculations.neighbours_info;

	//let testmat = new THREE.MeshLambertMaterial({color: 0x8cb5bd})
	//testmat.side = THREE.DoubleSide;

	//Add a simple icosphere
	/*let tempMesh = new THREE.Mesh( calculations.geometry,testmat);
	scene.add(new THREE.VertexNormalsHelper(tempMesh, helper_size, 0x000000, 1));
	scene.add(new THREE.FaceNormalsHelper( tempMesh, helper_size, 0x000000, 1 ));
	scene.add(tempMesh);

	console.log(tempMesh)*/

	//If I want to extrude the sphere
	//For each defined face
	let levelHeight = (maxRadius - minRadius)/heightLevels;
	current_level_height = levelHeight;

	let group = new THREE.Group();
	for (let f of calculations.geometry.faces){


		let vertices = calculations.geometry.vertices;

		//cuál es la altura de este nivel?
		

		

		//Para cada uno de los niveles
		for(let l = 0; l < heightLevels; l++){
			let minheight = minRadius +  (l * levelHeight);
			let maxHeight = minheight + levelHeight;



			var g = new THREE.Geometry();

			//I will extrude the three vertices for this face for the min height

			let pa = new THREE.Vector3(vertices[f.a].x, vertices[f.a].y, vertices[f.a].z) //vertices[tf.a].copy();
			let pb = new THREE.Vector3(vertices[f.b].x, vertices[f.b].y, vertices[f.b].z)
			let pc = new THREE.Vector3(vertices[f.c].x, vertices[f.c].y, vertices[f.c].z)
	
			pa = pa.normalize();
			pb = pb.normalize();
			pc = pc.normalize();

			let va = new THREE.Vector3(pa.x * minheight, pa.y * minheight, pa.z * minheight);
			let vb = new THREE.Vector3(pb.x * minheight, pb.y * minheight, pb.z * minheight);
			let vc = new THREE.Vector3(pc.x * minheight, pc.y * minheight, pc.z * minheight);

			//I will excale this for the max
			let va_top = new THREE.Vector3(pa.x * maxHeight, pa.y * maxHeight, pa.z * maxHeight);
			let vb_top = new THREE.Vector3(pb.x * maxHeight, pb.y * maxHeight, pb.z * maxHeight);
			let vc_top = new THREE.Vector3(pc.x * maxHeight, pc.y * maxHeight, pc.z * maxHeight);


			g.vertices.push(va);
			g.vertices.push(vb);
			g.vertices.push(vc);
			g.vertices.push(va_top);
			g.vertices.push(vb_top);
			g.vertices.push(vc_top);

			g.faces.push(new THREE.Face3(0,1,2))//bottom  OK
			g.faces.push(new THREE.Face3(3,4,5))//top OK

			g.faces.push(new THREE.Face3(1,4,3))
			g.faces.push(new THREE.Face3(1,3,0))

			g.faces.push(new THREE.Face3(4,1,2))
			g.faces.push(new THREE.Face3(4,2,5))

			g.faces.push(new THREE.Face3(2,3,5))
			g.faces.push(new THREE.Face3(2,0,3))

			g.computeFaceNormals();
			g.computeVertexNormals();

			let testmat = new THREE.MeshLambertMaterial({color: 0x717171, transparent:false})
			testmat.side = THREE.DoubleSide;

			let opacity = (0.2 -1 )*(l/3) + 1;
			testmat.opacity = opacity

			let tempMesh = new THREE.Mesh( g,testmat);
			
			targetList.push(tempMesh);
			//scene.add(tempMesh);
			group.add(tempMesh);

			//Add the cell to this level

			if(dictionary_by_level[l] == undefined){
				dictionary_by_level[l] = []
			}

			dictionary_by_level[l].push(tempMesh)

			let cell = new Cell(tempMesh, f.a, f.b, f.c, l);
			cells.push(cell);
		}

		
		

	}

	scene.add(group);
	sphere_group = group;

	
}

var loader = new THREE.FontLoader();
loader.load( 'https://rawgit.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json', function ( font ) {


loaded_font = font

	onModeUpdated();

  	basicSetup();
	addElementsToScene();

	prepareGUI();
	render();
});   

let gui_info = {
	"mode":"none",
	"addvoxel" : function(){
		current_mode = modes.adding;
		this.mode = modes.adding
		onModeUpdated()
		
	},
	"removevoxel": function(){
		current_mode = modes.removing;
		this.mode = modes.removing
		onModeUpdated()
	},
	"paintvoxel":function(){
		current_mode = modes.painting;
		this.mode = modes.painting
		onModeUpdated()
	},
	"current_terrain": "dirt"
}


function onModeUpdated(){
	document.getElementById("current-tool-p").innerHTML = descriptionForModes[gui_info.mode]
}


function prepareGUI(){

	gui = new dat.GUI();
	/*gui.add(gui_info, "message")

	let controller = gui.add(gui_info, "test");
	controller.onChange(function(value){
	})*/

	let terrain_editing_folder = gui.addFolder("Terrain editing")
	terrain_editing_folder.add(gui_info, "mode").listen();
	terrain_editing_folder.add(gui_info, 'addvoxel').listen();
	terrain_editing_folder.add(gui_info, 'removevoxel').listen();


	let terrain_painting_folder = gui.addFolder("Terrain painting")
	let terrain_options = Object.keys(CellType);
	terrain_painting_folder.add(gui_info, "paintvoxel")
	terrain_painting_folder.add(gui_info, "current_terrain", terrain_options )
	

}




// Render Loop
var render = function () {
  requestAnimationFrame( render );

  //cube.rotation.x += 0.01;
  //cube.rotation.y += 0.01;

  // Render the scene
  renderer.render(scene, camera);
};

