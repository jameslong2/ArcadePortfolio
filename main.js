import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import CannonUtils from 'cannon-utils';
import * as BufferGeometryUtils from './node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';
import { ConvexGeometry } from './node_modules/three/examples/jsm/geometries/ConvexGeometry.js';
import { FBXLoader } from './node_modules/three/examples/jsm/loaders/FBXLoader.js';
import { Material, Trimesh, Vec3 } from 'cannon-es';
import { BufferGeometry, CubeTextureLoader, Group, MeshMatcapMaterial, SpotLight } from 'three';
import {HTMLRenderer} from './renderer.js';
import {EffectComposer} from './node_modules/three/examples/jsm/postprocessing/EffectComposer.js';
import {UnrealBloomPass} from './node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {RenderPass} from './node_modules/three/examples/jsm/postprocessing/RenderPass.js';

document.querySelector("#abajo").addEventListener("click", MoverAbajo);
document.querySelector("#arriba").addEventListener("click", MoverArriba);
document.querySelector("#derecha").addEventListener("click", IrAlante);
document.querySelector("#izquierda").addEventListener("click", IrAtras);
document.body.addEventListener("click",PlayBasquet);
window.addEventListener("mousedown",Drag);
window.addEventListener("mouseup", DragStop);
var number=7;
var actualElement=0;
var marginTop=10;
var isChanged=false;
var lerp=0;
var isMoving=false;
var ballClicked=false;
var isOverBall=false;
var isThrowing=false;
var previousPoint=0;
var firstClickPos=new THREE.Vector3();
var firstTime;
var lastTime;
var initPos=new THREE.Vector3(0,230,230);
var reloj=new THREE.Clock(true);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 2000);
scene.background = new THREE.Color('black');
const ambient = new THREE.AmbientLight(new THREE.Color()); // soft white light
scene.add(ambient);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
scene.add(directionalLight);
const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.physicallyCorrectLights=true;
renderer.shadowMap.enabled=true;
renderer.gammaInput = true;
renderer.gammaOutput = true;
renderer.toneMapping=THREE.ReinhardToneMapping;
renderer.toneMappingExposure=3;
var canvas=document.body.appendChild(renderer.domElement);

var pointer=new THREE.Vector2();
var raycaster=new THREE.Raycaster();
var mousePos=new THREE.Vector3();
var vec=new THREE.Vector3();


const physicsWorld = new CANNON.World({
    gravity: new CANNON.Vec3(0, -170, 0),
});
const cannonDebugger = new CannonDebugger(scene, physicsWorld);

var mat1Phys=new CANNON.Material({friction:0});
physicsWorld.addContactMaterial(new CANNON.ContactMaterial(mat1Phys,mat1Phys,{friction:0}));
const ballBody=new CANNON.Body({type:CANNON.Body.DYNAMIC,mass:1,material:mat1Phys});
ballBody.addShape(new CANNON.Sphere(19));
ballBody.position.set(-153.5,200,410);
ballBody.angularDamping=0.4;
physicsWorld.addBody(ballBody);

//renderer.render(scene, camera);
const arcadelight=new THREE.PointLight();
arcadelight.position.set(0,230,120);
arcadelight.intensity=1000;
arcadelight.distance=10000;
//scene.add(arcadelight);
var renderScene = new RenderPass(scene, camera);
renderScene.enabled=true;
// Bloom pass
var bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1,
  0,
  0.1
);
var composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);
camera.near=0.00001;
camera.far=10000;
camera.position.z =230;
camera.position.y = 230;
camera.position.x = 0;
//camera.rotateX(THREE.MathUtils.degToRad(90));
//camera.rotateY(THREE.MathUtils.degToRad(-90));
var points=[];
var actualPoint=1;
var mixer;
var animationActions = [];
var canvas1;
var creado=true;
var arcadeLoader = new FBXLoader();
var arcade;
arcadeLoader.load(
    'arcade.fbx', function (object) {
        arcade=object;
        arcade.rotateY(THREE.MathUtils.degToRad(-90));
        for(var i=0;i<arcade.children.length;i++){
            var mat=new THREE.MeshStandardMaterial();
            mat.color=arcade.children[i].material.color;
            mat.emissiveIntensity=0;
            if(i==1 || i==6){
                mat=new THREE.MeshStandardMaterial();
                mat.color=new THREE.Color('red');
                mat.emissive=new THREE.Color('red');
                mat.emissiveIntensity=1000;
            }
            arcade.children[i].material=mat;
            arcade.children[i].material.needsUpdate = true;
            
        }
        scene.add(arcade);
    });
    var salaLoader = new FBXLoader();
    var sala;
    salaLoader.load(
        'arcade8.fbx', function (object) {
            sala=object;
            sala.name="sala";
            console.log(sala);
            sala.rotateY(THREE.MathUtils.degToRad(-90));
            scene.add(sala);
        });
        var canasta;
        var canastaLoader = new FBXLoader();
        canastaLoader.load(
            'cansta2.fbx', function (object) {
                canasta=object;
                canasta.name="canasta";
                console.log(canasta);
                canasta.rotateY(THREE.MathUtils.degToRad(-90));
                scene.add(canasta);
            });
            var ball;
            var ballLoader = new FBXLoader();
            ballLoader.load(
                './bola/ball.fbx', function (object) {
                    ball=object;
                    ball.name="ball";
                    scene.add(ball);
                });
    var yoLoader = new FBXLoader();
    var yo;
    yoLoader.load(
        'yo.fbx', function (object) {
            yo=object;
            mixer = new THREE.AnimationMixer(object);
            const animationAction = mixer.clipAction(
            object.animations[0]
            );
            animationActions.push(animationAction);
            animationActions[0].play();
            console.log(yo);
            yo.name="yo";
            var mat1=new THREE.MeshBasicMaterial();
            mat1.map=new THREE.TextureLoader().load( 'dummy_wood.jpg' );
            mat1.color=new THREE.Color('#2b2b2b');
            yo.children[0].material=mat1;
            yo.rotateY(THREE.MathUtils.degToRad(-90));
            scene.add(yo);
        });
    //
//const video = document.getElementById( 'video' );
//const texture = new THREE.VideoTexture( video );
//
    var pantallaLoader = new FBXLoader();
    var pantalla;
    pantallaLoader.load(
    'pantalla2.fbx', function (object) {
        //object.children[0].material.map=texture;
        var mat=new THREE.MeshBasicMaterial();
        pantalla=object;
        scene.add(pantalla);
        pantalla.rotateY(THREE.MathUtils.degToRad(-90));
        pantalla.children[0].meterial=mat;
        pantalla.children[0].material.needsUpdate = true;
    });
var id;
function Update() {
    id=requestAnimationFrame(Update);
    physicsWorld.fixedStep();
    //cannonDebugger.update();
    if (mixer != null) {
        mixer.update(reloj.getDelta());
    }
    if(!isChanged && arcade!=null && pantalla!=null && sala!=null && canasta!=null && ball!=null){
        Init();
    }
    if(creado && canvas1!=null && pantalla!=null){
        CrearPantalla();
        creado=false;
    }
    if(isMoving){
        if(lerp<1){
            lerp+=1-Math.pow(0.1,reloj.getDelta());
            //initPos.lerp(points[actualPoint],lerp);
            //camera.position.set(initPos.x,initPos.y,initPos.z);
            camera.position.lerp(points[actualPoint],0.03);
        }else{
            isMoving=false;
            lerp=0;
            initPos=points[actualPoint];
        }
    }

    //
    ballBody.position.set(THREE.MathUtils.clamp(ballBody.position.x,-193.5,-113.5),THREE.MathUtils.clamp(ballBody.position.y,125,280),THREE.MathUtils.clamp(ballBody.position.z,0,400));
    if(ballClicked && isThrowing){
        ballBody.velocity=CANNON.Vec3.ZERO;
        ballBody.position.set(firstClickPos.x,firstClickPos.y,370);
    }
    else if(ballClicked && !isThrowing){
        ballBody.velocity=CANNON.Vec3.ZERO;
        ballBody.position.set(THREE.MathUtils.clamp(mousePos.x,-193.5,-113.5),THREE.MathUtils.clamp(mousePos.y,125,280),370);
    }
    //
    if(ball!=null){
        ball.children[0].position.set(ballBody.position.x,ballBody.position.y,ballBody.position.z);
        ball.children[0].quaternion.x=ballBody.quaternion.x;
        ball.children[0].quaternion.y=ballBody.quaternion.y;
        ball.children[0].quaternion.z=ballBody.quaternion.z;
        ball.children[0].quaternion.w=ballBody.quaternion.w;
    }
    //cancelAnimationFrame(id);
    //renderer.render(scene, camera);
    composer.render();
}
//video.play();
//

//
CreateArcadeCanvas();
var onMouseMove;
Update();

//
function Init(){
    console.log("hola");
    ball.children[0].name="bola";
    const roadbody = new CANNON.Body({ type: CANNON.Body.STATIC, mass: 0,material:mat1Phys});
    for(var i=0;i<canasta.children.length;i++){
        //var newGeometry = BufferGeometryUtils.mergeVertices(canasta.children[i].geometry);
        var newGeometry = BufferGeometryUtils.mergeVertices(canasta.children[i].geometry);
        var newMesh = new THREE.Mesh(newGeometry);
        var number=canasta.children[i].scale.x/3.85;
        newMesh.geometry.scale(number,number,number);
        //console.log(newMesh.geometry.getIndex());
        const forma = CannonUtils.CreateTriMesh(newMesh);
        //var scale=new CANNON.Vec3(canasta.children[i].scale.x,canasta.children[i].scale.y,canasta.children[i].scale.z);
        //forma.setScale(new CANNON.Vec3(3.85,3.85,3.85));
        forma.updateAABB();
        roadbody.addShape(forma);
    }
    var quat=new CANNON.Quaternion();
    quat.setFromEuler(THREE.MathUtils.degToRad(-90),0,THREE.MathUtils.degToRad(-90));
    roadbody.quaternion.set(quat.x,quat.y,quat.z,quat.w);
    //roadbody.quaternion.setFromEuler(THREE.MathUtils.degToRad(-90),0,THREE.MathUtils.degToRad(-90));
    roadbody.position.set(-153.5,50,318);
    physicsWorld.addBody(roadbody);
    //camera.position.set(roadbody.position.x,roadbody.position.y,roadbody.position.z+100);
    for(var i=0;i<arcade.children.length;i++){
        if(i!=1 || i!=6){
            arcade.children[i].material.color.multiplyScalar(0.15);
        }

    }
    scene.traverse((obj) => {
        if(obj.isMesh){
            obj.castShadow=true;
            obj.receiveShadow=true;
            obj.material.transparent=false;
            //obj.frustumCulled = false;
        }
        if(obj.isMesh && obj.name=="pantalla") {
            var mat=new THREE.MeshBasicMaterial();
            mat.map=new THREE.CanvasTexture(canvas1.getContext('2d').canvas);
           obj.material = mat;
        }
        if(obj.name=="sala"){
            obj.children[29].getWorldPosition(ball.children[0].position);
        }
     })
     scene.traverse((obj) => {
        if(obj.name=="canasta"){
            var mate=new THREE.MeshStandardMaterial();
            var tex=new THREE.TextureLoader().load( 'rejas.png' );
            mate.map=tex;
            mate.side=THREE.DoubleSide;
            mate.transparent=true;
            mate.opacity=1;
            mate.color=new THREE.Color('black');
            var mate2=new THREE.MeshStandardMaterial();
            var tex2=new THREE.TextureLoader().load( 'basket.png' );
            mate2.map=tex2;
            mate2.side=THREE.DoubleSide;
            mate2.transparent=true;
            mate2.opacity=1;
            mate2.color=new THREE.Color('#6e6e6e');
            obj.children[9].material=mate;
            obj.children[5].material=mate;
            obj.children[4].material=mate2;
            obj.children[8].material.color=new THREE.Color('#3d3d3d');
            obj.children[14].material.color=new THREE.Color('grey');
        }
     })
     var elvector=new THREE.Vector3();
     sala.children[18].getWorldPosition(elvector);
     points.push(elvector);
     points.push(new THREE.Vector3(0,230,230));
     var elvector2=new THREE.Vector3();
     sala.children[8].getWorldPosition(elvector2);
     points.push(elvector2);
    pantalla.children[0].material.color.multiplyScalar(0.1);
    var spotlight1=new THREE.SpotLight('white',1000,0,55);
    scene.add(spotlight1);
    scene.add(spotlight1.target);
    spotlight1.castShadow=true;
    spotlight1.angle=100;
    spotlight1.decay=1.1;
    spotlight1.penumbra=1;
    spotlight1.position.set(0,530,260);
    spotlight1.target.position.set(0,0,260);

    //
    var spotlight2=new THREE.SpotLight('white',1000,0,55);
    scene.add(spotlight2);
    scene.add(spotlight2.target);
    spotlight2.castShadow=true;
    spotlight2.angle=100;
    spotlight2.decay=1.1;
    spotlight2.penumbra=1;
    spotlight2.position.set(600,530,260);
    spotlight2.target.position.set(600,0,260);
    //
    var spotlight3=new THREE.SpotLight('white',1000,0,55);
    scene.add(spotlight3);
    scene.add(spotlight3.target);
    spotlight3.castShadow=true;
    spotlight3.angle=100;
    spotlight3.decay=1.1;
    spotlight3.penumbra=1;
    spotlight3.position.set(1200,530,260);
    spotlight3.target.position.set(1200,0,260);
    isChanged=true;
    //
    onMouseMove=(event)=>{
        if(ballClicked){
            vec.set(
                (event.offsetX / canvas.clientWidth) * 2 - 1,
                -(event.offsetY / canvas.clientHeight) * 2 + 1,
                370 );
            
            vec.unproject( camera );
            
            vec.sub( camera.position ).normalize();
            
            var distance = (370- camera.position.z) / vec.z;
            
            mousePos.copy( camera.position ).add( vec.multiplyScalar( distance ) );
        }else{
            pointer.x=(event.offsetX / canvas.clientWidth) * 2 - 1;
            pointer.y=-(event.offsetY / canvas.clientHeight) * 2 + 1;
            raycaster.setFromCamera(pointer,camera);
            var intersects=raycaster.intersectObjects(ball.children);
            for(var i=0;i<intersects.length;i++){
                isOverBall=true;
            }
        }
    }
    window.addEventListener("mousemove",onMouseMove);
}
function CrearPantalla(){
 pantalla.children[0].material.map=new THREE.CanvasTexture(canvas1.getContext('2d').canvas);
}
function CreateArcadeCanvas(){
    html2canvas(document.querySelector("#contenido")).then(canvas => {
        canvas1=canvas;
        creado=true;
    });
}
function MoverAbajo(){
    let elements=document.getElementsByClassName("elementoProyecto");
    if(actualElement!=elements.length-1){
        actualElement++;

        marginTop-=number;
        for(var i=0;i<elements.length;i++){
            var value=marginTop+number*(i);
            elements[i].style.setProperty('top', value+'%');
        }
        
        creado=false;
        canvas1=null;
        ApplyColor();
        CreateArcadeCanvas();
    }

}
function MoverArriba(){
    let elements=document.getElementsByClassName("elementoProyecto");
    if(actualElement!=0){
        actualElement--;
    
        for(var i=0;i<elements.length;i++){
            
            console.log(number);
            var value=marginTop+number*(i+1);
            elements[i].style.setProperty('top', value+'%');
        }
        marginTop+=number;
        creado=false;
        canvas1=null;
        ApplyColor();
        CreateArcadeCanvas();
    }

}
function IrAlante(){
    previousPoint=actualPoint;
    actualPoint++;
    isMoving=true;
}
function IrAtras(){
    previousPoint=actualPoint;
    actualPoint--;
    isMoving=true;
}
function ApplyColor(){
    let elements=document.getElementsByClassName("elementoProyecto");
    for(var i=0;i<elements.length;i++){
        
        if(actualElement==i){
            elements[i].style.setProperty('background', 'rgb(90, 90, 255)');
        }else{
            elements[i].style.setProperty('background', 'none');
        }
    }
}

function PlayBasquet(){
    if(isOverBall){
        ballClicked=true;
    }
}
function Drag(){
    if(!isThrowing && ballClicked){
        isThrowing=true;
        ball.children[0].getWorldPosition(firstClickPos);
        firstTime=new Date().getTime();
    }
}
function DragStop(){
    if(isThrowing && ballClicked){
        ballClicked=false;
        isThrowing=false;
        isOverBall=false;
        var distance=firstClickPos.distanceTo(mousePos);
        var offsetx=Math.abs(firstClickPos.x-mousePos.x)*(firstClickPos.x>mousePos.x?-1:1);
        lastTime=new Date().getTime();
        var velocity=distance/(lastTime-firstTime);
        ballBody.applyImpulse(new CANNON.Vec3(offsetx,distance*4.3,-velocity*500));
    }
}
//
//
