class ThreeSelection {

    constructor() {
        this.selectedObjects = [];
        this.overrideMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xffffff)
        });
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
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D tex;
                uniform float width;
                uniform float height;
                uniform float time;
                
                const float Pi2 = 6.28318530718; 
                const float Directions = 16.0;
                const float Quality = 3.5; 
                const float Size = 8.0; 
                
                void main() {
        
                    vec2 Radius = Size/vec2(width, height);
                    float alpha = texture2D(tex, vUv).a;
                    
                    for (float d = 0.0; d < Pi2; d += Pi2/Directions) {
                        for (float i = 1.0/Quality; i <= 1.0; i += 1.0/Quality) {
                            alpha += texture2D( tex, vUv+vec2(cos(d),sin(d))*Radius*i).a;
                        }
                    }
                    float result = alpha / (Quality * Directions - 15.0);
                    vec4 outlineColor = vec4(1.0, sin(time)*0.5+0.5, 0.0, 1.0); 
                    gl_FragColor = outlineColor * (min(1.0, alpha) - result);
                }
            `
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

    renderSelection(renderer, scene, camera) {
        renderer.setRenderTarget(this.renderTarget);
        const oldOverrideMaterial = scene.overrideMaterial;
        scene.overrideMaterial = this.overrideMaterial;
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
        scene.overrideMaterial = oldOverrideMaterial
        renderer.setRenderTarget(null);

        const autoClear = renderer.autoClear;
        renderer.autoClear = false;
        this.uniforms.width.value = innerWidth;
        this.uniforms.height.value = innerHeight;
        this.uniforms.time.value = Date.now()%10000/1000;
        renderer.render(this.fullScreenQuadScene, this.orthographicCamera);
        renderer.autoClear = autoClear;

    }

    clearSelection() {
        this.selectedObjects.splice(0, this.selectedObjects.length);
    }
}