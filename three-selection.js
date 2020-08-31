class ThreeSelection {

    constructor() {

        this.fragmentShader = `
            varying vec2 vUv;
            uniform sampler2D tex;
            uniform float width;
            uniform float height;
            uniform float time;
            
            const float pi2 = 6.28318530718; 
            const float directions = 12.0;
            const float quality = 3.0; 
            const float size = 8.0; 
            
            void main() {
                vec2 radius = size/vec2(width, height);
                float alpha;
                for (float d = 0.0; d < pi2; d += pi2/directions) 
                    for (float i = 1.0/quality; i <= 1.0; i += 1.0/quality) 
                        alpha += texture2D(tex, vUv+vec2(cos(d),sin(d))*radius*i).a;
                float result = alpha / (directions*quality - directions*2.);
                vec4 outlineColor = vec4(1.0, sin(time)*0.5+0.5, 0.0, 1.0); 
                gl_FragColor = outlineColor * (min(1.0, alpha) - result);
            }
        `;

        this.selectedObjects = [];
        this.renderTarget = new THREE.WebGLRenderTarget(2048, 2048);
        this.uniforms = {
            tex: new THREE.Uniform(this.renderTarget.texture),
            height: new THREE.Uniform(1),
            width: new THREE.Uniform(1),
            time: new THREE.Uniform(0),
        }
        const quadGeometry = new THREE.PlaneGeometry(2, 2);
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            transparent: true,
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;        
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `,
            fragmentShader: this.fragmentShader
        });

        const quadMesh = new THREE.Mesh(quadGeometry, shaderMaterial);
        this.fullScreenQuadScene = new THREE.Scene();
        this.fullScreenQuadScene.add(quadMesh);
        this.orthographicCamera = new THREE.OrthographicCamera();
        this.orthographicCamera.position.z = 1;
    }

    addToSelection(object3d) {
        this.selectedObjects.push(object3d);
    }

    removeFromSelection(object3d) {
        let index = this.selectedObjects.indexOf(object3d);
        index !== -1 && this.selectedObjects.splice(index, 1);
    }

    contains(object3d){
        return this.selectedObjects.indexOf(object3d) !== -1;
    }

    toggleSelected(object3d){
        this.contains(object3d) ? this.removeFromSelection(object3d) : this.addToSelection(object3d);
    }

    clearSelection() {
        this.selectedObjects.splice(0, this.selectedObjects.length);
    }

    renderSelection(renderer, scene, camera) {
        renderer.setRenderTarget(this.renderTarget);

        scene.traverse(o => {
            o.originalVisible = o.visible
            o.visible = false;
        });
        this.selectedObjects.forEach(selected => {
            selected.traverse(o => o.visible = true)
            selected.traverseAncestors(o => o.visible = true)
        });
        renderer.render(scene, camera);
        scene.traverse(o => o.visible = o.originalVisible);
        renderer.setRenderTarget(null);

        const autoClear = renderer.autoClear;
        renderer.autoClear = false;
        this.uniforms.width.value = innerWidth;
        this.uniforms.height.value = innerHeight;
        this.uniforms.time.value = Math.PI*2*((Date.now()%3000)/3000);
        renderer.render(this.fullScreenQuadScene, this.orthographicCamera);
        renderer.autoClear = autoClear;

    }


}