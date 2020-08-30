class ThreeSelection {

    constructor() {
        this.selectedObjects = [];
        this.selectedObjects.background = null;
        this.overrideMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0xffffff)
        });
        this.renderTarget = new THREE.WebGLRenderTarget(2048, 2048);

        const quadGeometry = new THREE.PlaneGeometry(2, 2);
        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                tex: {
                    type: "t",
                    value: this.renderTarget.texture
                }
            },
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
                
                void main() {
                    float Pi2 = 6.28318530718; 
                    float Directions = 16.0;
                    float Quality = 3.0; 
                    float Size = 8.0; 
                    vec2 Radius = vec2(0.005);

                    vec4 Color = texture2D(tex, vUv);
                    
                    for (float d = 0.0; d < Pi2; d += Pi2/Directions) {
                        for (float i = 1.0/Quality; i <= 1.0; i += 1.0/Quality) {
                            Color += texture2D( tex, vUv+vec2(cos(d),sin(d))*Radius*i);
                        }
                    }
             
                    gl_FragColor = vec4(1.,0.,0.,1.)*min(vec4(1.0), Color) - Color / (Quality * Directions - 15.0);
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
        renderer.render(this.fullScreenQuadScene, this.orthographicCamera);
        renderer.autoClear = autoClear;

    }

    clearSelection() {
        this.selectedObjects.splice(0, this.selectedObjects.length);
    }
}