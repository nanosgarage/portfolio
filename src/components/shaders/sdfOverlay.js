/**
 * Writing the SDF shader
 * Step 1: make some basic crap
 * First step is just to make the basic shader, and draw it to a mesh and make sure it's visible
 * to the camera.
 * 
 * Step 2: Give pixels world position for relevance
 * The basic aspect of an SDF is that each pixel knows how far it is from seomething. The gaps in the 
 * sdf are going to be in world position, so each pixel needs its own world position.
 * This is done in the vertex shader, which hands it to the fragment via vWorld
 * Make the varying vWorld in this step which passes to fragment.
 * 
 * Step 3: Expand to the whole screen, and cut a circle.
 *  Now ready to expand the shader to cover screen.
 * using circle as it's the simplest way to measure distance with sdf's when setting up.
 * Idea of an sdf is that every pixel asks how far am I from the edge of this.
 * Measuring distance from the pixel to the circle's center: length(p - center), subtract radius.
 * signed distance field meaning can be negative, and signed tells you if its inside or outside.
 * pseudocode: 
 * if d > 0:
 *  outside color
 * if d < 0:
 *  inside color
 * Step 4: Placing holes around all objects.
 * 
 * create a function for calculating signed distance for each location. (sdCircle)
 * With SDFs, we always take the lowest value as it's final result, as if it's inside something and should be different, it'll be negative.
 * min = combine shapes. Taking min of 2 sdf gives you both shapes together, i.e. a union
 * we repeat this updating d and picking the minium between current and the next item.
 * 
 * Step 5: Following specific shapes instead of circles.
 * For a circle we measure from the center and we'll do the same with rectangles
 * We use a rectangles half size, as its essentially like a circle's radius.
 * Updating the formula for caluclating a signed distance field for a rectangle we have:
 *  vec2 q = abs(p) - halfsize; this is the distance from the right and top edge.
 * We use absolute values because an answer on the left of the box is the same on the right, but negative, so it's easier to just
 * have every answer be in the same location. Otherwise, we would need formulas for each edge (right edge = p.x - 1, left edge = -p.x -1) etc.
 *  There are 3 cases to look at for rectangles: inside (-x, -y/0), beside (+x, 0), and past both corners (+x, +y)
 * Inside: Both values are negative or 0, so you're inside, and the bigger value is what we take away, so inside = max(q.x, q.y)
 * Beside: One value is positive, the other is 0 or negative, meaning you're besides the right edge (as we folded the rectangegle by using absolute values)
 * Since one value is positive, the negative value doesn't matter, so we just take the positive value max(q, 0)
 * Past corner: The nearest point to the box is its corner, and the distance is the diagonal to it: length(x, y) (using pythagoras)
 * For any pixel, at most one half are non-zero, so adding them picks out which is doing the work.
 * we do return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) i.e. outside half and then inside half.
 * The outside half replaces any negative part of q with 0, keeping only how far past the edge, and length measures the distance.
 * If you're inside, both parts are negative, so this becomes 0.
 * The inside half max picks the bigger gap, which is inside the nearest edge, min keeps only if it is negative.
 * If you're outside, at least one part of q is positive, so the max is positive min(positive, 0) = 0 and switches off.
 * Examples assuming box is 2 wide and 1.2 tall
 * beside (1.5, 0): q = (0.5, -0.6) Outside half 0.5, inside half 0, sum = 0.5
 * past corner (1.3, 1.0) q = (0.3, 0.4) outside half 0.5, inside 0 sum = 0.5
 * inside (0.5, 0) q = (-0.5, -0.6) outside half 0, inside -0.5, sum = -0.5
 * we're basically looking at combining all these cases into one line, and so rather than writing if statements, we can just
 * have them 0 out. If its outside one will work and the other wont sorta vibe..
 * 
 * Step 6: Rounding da corners
 * With SDF, subtracting any distance will inflate the shape, can be seen through visualizations of SDF's around boxes.
 * Points at an equal distance from a single point will form a circle, so when we push a corner out, it becomes a curve.
 * Inflating will make the box bigger though, so first we'll shrink the box by r.
 * vec2 q = abs(p) - (halfsize - r);
 * return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
 * if r is bigger than the halfsize the shape will break, so we need to limit it via: r = min(r, min(halfSize.x, halfSize.y));
 * 
 * Step 7: Tying back into javascript
 * We send uniforms to the shader via js inside a uniforms object, wrapped as {value: ...}
 * Throughout this we've needed 4 things, the center of the rectangles, and their halfsize, so we'll send that as a vec4 per button.
 * We do this in the shader like so:
 *  declare a uniform vec4 of 4 rectangles: uniform vec4 uButtons[4]
 *  Input them in as values to the function using swizzling, and create via a for loop to act on each.
 * We also start d as insanely far away because we're looking at all the boxes at once.
 * In javascript we create the class' uniforms object, and pass them to the mesh's shader.
 * We now also need a way to measure the size of the buttons, so we set that function up in hte constructor (setButtons)
 * SetButtons works as follows
 *  We make 3 empty containers, box3s, which in threeJS shrink wrap any object to find its edges.
 * We loop over the panels, with panel being current and i being index.
 * updateMatrixWorld forces the panel's matrix to update, ensuring that its location is accurate.
 * The box's location and size is set around the panel, and we work out the width, height and half sizes.
 * Next we call it inside of main.js by instantiating the overlay, calling set buttons, and adding the mesh to the scene.
 * 
 * Step 8: Smoothing edges further
 * Right now there is some aliasing, which comes from the if statement determining yes or no to being inside or not.
 * The fix is to give these pixels right on the edge a semi-opacity.
 * This fade can't be a fixed number though because in my situation I zoom in and out of the webpage. i.e. zoomed out a pixel might cover 
 * 0.04 world units, zoomed in could be 0.0005 or soimething
 * fwidth(d) gives us the distance unit of one pixel in NDC, so we do float antiAlias = fwidth(d);
 * for fading, we can use the smoothstep function: x below a gives 0, x above b gives 1, in between, we have an s curve: float opacity = smoothstep(-antiAlias, antiAlias, d);
 * We can now use the opacity value in the fragment shader's output: gl_FragColor = vec4(x, y, z, opacity);
 * We replace our if else statement with what we see now.
 * 
 * Step 9: Moving boobles
 * Surprisingly little amount of shader work involved and this is mainly JS work.
 * The idea is to add an extra hole, which isn't tied to any button and JS controls where it is.
 * At rest, it sits ontop of an existing button so you can't see it. On click, it jumps to the clicked button and gets a target: the box.
 * Every frame it slides a bit of the way to that target
 * Declare the new hole in the shader
 * Add it do d after the loop, (remember SDFs are just the total for each pixel and we want the minium value)
 * Then we pass in the new uniform to the constructor 
 * There are 2 things to track, where the bubble is and where it's heading, so we add those to the class. (target, index)
 * Inside setButtons after loop, we copy the location of the first button into the uHole's index and target, i.e. location of first panel.
 * Make the openTo function. This read's the box's size, snaps the bubble to the clicked location and remember it, then set the target to the box's center + half size + padding
 * Add the close function, which is where the button came from.
 * Add the tick function, which is the animation. Each frame, bubble moves 8& of rameining way to the target using lerp
 * In init, we tag each panel with an index value for open and close functions to use.
 * We also push the sdf overlay into updateables so it runs the tick method.
 * In onPointerClick, we call the openTo function with the intersected button index and the target.
 * In goHome, we call this.sdf.close();
 * 
 * Step 10: Make it look gooey
 * - Existing problem with min, it picks whichever hole is closer, and switches instantly at the point where two distances are equal
 * Instant switch is the sharp crease when 2 holes meet.
 * To get goo, pixels that are about equally close should be pulled a little inside to fill the crease.
 * How close are tehse 2 distances? thats b -a  compared to a range k. If the difference is bigger than k, one hole wins, so behave like min
 * If it's within k, the pixel is in between, so blend. K sets how wide the between zone is i.e. how sticky.
 * turn that into a weight, h: float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
 *      a clearly closer: b -a = +k or more, h = 1, use a.
 *      equal b - a = 0, h = 0.5, halfway
 *      b closer -k or less, h = 0, use b.
 * then blend by that weight with mix(b, a, h)
 * mix slides from b towards a by h.
 * Pull down in the middle (the gooey part), we want inbetween pixels to count as more "inside" so we subtract a bit:
 *      -k * h * (1.0 - h)
 * when h is 0 or 1 that equation = 0, and biggest when h is 0.5, so pull down only happens in the in between zone, strongest right in the middle.
 * (k = 0.6)
Pixel equally close to two holes: a = 0.2, b = 0.2
h = 0.5, mix = 0.2, pull-down = 0.6 × 0.25 = 0.15
result 0.05, compared to min's 0.2. Much closer to the edge, so the gap starts filling in.
Pixel clearly closer to one hole: a = 0.2, b = 1.5
b − a = 1.3, more than k, so h = 1 and the pull-down is 0
result 0.2, exactly the same as min. No goo where it isn't wanted.
    this becomes the smin function
    we switch min for smin, with a k for each, buttons receiving 0.6 for softer, and bubble is 1.5

Step 11: Wobble
idea is to nudge d a little differently everywhere. Wherever d = 0, if you add a small amount at some spot, the edge moves.
sin(x) goes smoothly up and down between -1 and 1 forever. 
sin(p.x * 2.1 + uTime * 1.9) * sin(p.y * 1.7 - uTime * 1.3);
adding time on one side and subtracting on the other makes the wave move in different directions, and the floats determine the size of the ripples.
Then diagonally across we add a wave by using x and y at the same time:
+ 0.3 * sin(p.x * 4.3 + p.y * 3.1 - uTime * 2.7)

Then just need to send wobble and time via uniforms in js constructor.
In tick we do time = time * 0.001 since time is in ms, we turn it into seconds here.

To make it wobble harder while moving, we measure how far its moved each frame.
Add _prevHole to the constructor to remember where it was.
Then in tick we do the calculations for moving it, how far it was, how wobbly it should be, and ease towrads a value.

Step 12: Glowing edge
idea: near the edge is when d is close to 0.
abs(d) gives us this value, distance to edge, so we turn closeness into a zero to 1 brightness.
float rim = 1.0 - smoothstep(0.0, antiAlias * 2.5, abs(d));
Because its measured with antiAlias, the line stays teh same thickness whether your zoomed in or not.

Color: blend toward the rim color: vec3 col = mix(uColor, uRimColor, rim);
Opacity: keep rim visible inside the hole too gl_FragColor = vec4(col, max(opacity, rim));
deep in the cover	1	0	1	solid dark
on the edge	0.5	1	1	solid bright rim
deep in the hole	0	0	0	see-through

add 2 new color uniforms to top
then update the color output at the end alongside, rim, and col.
 */

import * as THREE from 'three';

const vertexShader = /* glsl */ `
varying vec2 vWorld;

void main(){
    vec4 world = modelMatrix * vec4(position, 1.0); 
    vWorld = world.xy;
    gl_Position = projectionMatrix * viewMatrix * world;
}
`;
//summary: gl_position decides where to draw, vWorld gives each drawn pixel info for what color it should be.
// world is where the corner (vertex) is in the world.
// vWorld is the 2D version, passed to the fragment shader, which in the fragment shader is blended
// such that each pixel gets a value. i.e. where the pixel is in the world.
// gl_position is where the corner is ON SCREEN. It doesn't get passed to the fragment shader but
// is used to find which fragments the shader applies to. (pixels to run the fragment shader on)
// model matrix = world, viewMatrix = camera, projectionMatrix = zoom and fov. That give you where
// a vertex is on the screen in NDC.

const fragmentShader = /* glsl */ `
uniform vec4 uButtons[4];
uniform vec4 uHole;
uniform float uTime;
uniform float uWobble;
uniform vec3 uColor;
uniform vec3 uRimColor;

varying vec2 vWorld;

float sdBox(vec2 p, vec2 halfSize, float r){
    r = min(r, min(halfSize.x, halfSize.y));
    vec2 q = abs(p) - (halfSize - r);
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

void main(){ 
    vec2 p = vWorld;
    vec2 size = vec2(1.0, 0.6);

    float d = 1e5;
    for (int i = 0; i < 4; i++){
        d = smin(d, sdBox(p - uButtons[i].xy, uButtons[i].zw, 0.4), 0.6);
    }

    d = smin(d, sdBox(p - uHole.xy, uHole.zw, 0.6), 1.5);

    float wave = sin(p.x * 2.1 + uTime * 1.9) * sin(p.y * 1.7 - uTime * 1.3) + 0.3 * sin(p.x * 4.3 + p.y * 3.1 - uTime * 2.7);
    d += wave * uWobble;

    float antiAlias = fwidth(d);
    float opacity = smoothstep(-antiAlias, antiAlias, d);
    float rim = 1.0 - smoothstep(0.0, antiAlias * 2.5, abs(d));

    vec3 col = mix(uColor, uRimColor, rim);
    gl_FragColor = vec4(col, max(opacity, rim));
}
`;

export class SdfOverlay {
    constructor({color = 0x0000e9, rimColor = 0x0000ef} = {}) {

        this.uniforms = {
            uButtons: {
                value: [
                    new THREE.Vector4(),
                    new THREE.Vector4(),
                    new THREE.Vector4(),
                    new THREE.Vector4(),
                ],
            },
            uHole: {value: new THREE.Vector4()},
            uTime: {value: 0},
            uWobble: {value: 0.1},
            uColor: {value: new THREE.Color(color)},
            uRimColor: {value: new THREE.Color(rimColor)},
        };

        this.holeTarget = new THREE.Vector4();
        this.homeIndex = 0;
        this._prevHole = new THREE.Vector4();

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200), 
            new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader, 
                fragmentShader,
                transparent: true,
                depthWrite: false,

            })
        );
        this.mesh.position.z = -0.5;
        this.mesh.renderOrder = 999;
        this.mesh.raycast = () => {};
    }

    setButtons(panels, padding = 0.25){
        const box = new THREE.Box3();
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        panels.forEach((panel, i) => {
            panel.updateMatrixWorld(true);
            box.setFromObject(panel);
            box.getCenter(center);
            box.getSize(size);

            this.uniforms.uButtons.value[i].set(
                center.x, center.y,
                size.x / 2 + padding, size.y / 2 + padding
            );
        });

        this.uniforms.uHole.value.copy(this.uniforms.uButtons.value[0]);
        this.holeTarget.copy(this.uniforms.uButtons.value[0]);
    }

    openTo(buttonIndex, container, padding = 0.35){
        const {width, height} = container.userData.size;

        this.uniforms.uHole.value.copy(this.uniforms.uButtons.value[buttonIndex]);
        this.homeIndex = buttonIndex;

        this. holeTarget.set(
            container.position.x, container.position.y,
            width / 2 + padding, height / 2 + padding
        );
    }

    close() {
        this.holeTarget.copy(this.uniforms.uButtons.value[this.homeIndex]);
    }

    tick(time) {
        const hole = this.uniforms.uHole.value;
        this._prevHole.copy(hole);
        hole.lerp(this.holeTarget, 0.08);

        const speed = this._prevHole.sub(hole).length(); //how far its moved
        const targetWobble = 0.04 + Math.min(speed * 1.5, 0.15);
        this.uniforms.uWobble.value = THREE.MathUtils.lerp(this.uniforms.uWobble.value, targetWobble, 0.1);
        
        this.uniforms.uTime.value = time * 0.001;
    }
}