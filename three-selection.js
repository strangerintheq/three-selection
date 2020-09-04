class ThreeSelection {

    constructor(renderTextureWidth = 1024, renderTextureHeight = 1024) {

        this.selectedObjects = [];

        this.renderTarget = new THREE.WebGLRenderTarget(renderTextureWidth, renderTextureHeight);

        const quadGeometry = new THREE.PlaneGeometry(2, 2);
        const shaderMaterial = new THREE.ShaderMaterial({

            transparent: true,
            uniforms: {
                tex: new THREE.Uniform("t", this.renderTarget.texture)
            },
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
                
                const float Pi2 = 6.28318530718;
                const float Directions = 12.0;
                const float Quality = 2.0; 
                const float Size = 8.0; 
                const vec2 Radius = vec2(0.007);
                 
                void main() {
                    float alpha = texture2D(tex, vUv).a;
                    for (float d = 0.0; d < Pi2; d += Pi2/Directions) 
                        for (float i = 1.0/Quality; i <= 1.0; i += 1.0/Quality) 
                            alpha += texture2D( tex, vUv+vec2(cos(d),sin(d))*Radius*i).a;
                    float result = alpha / (Quality * Directions - 15.0);
                    vec4 outlineColor = vec4(1.0, 1.0, 0.0, 1.0);
                    gl_FragColor = outlineColor * min(1.0, alpha) - result;
                }
            `
        });

        const quadMesh = new THREE.Mesh(quadGeometry, shaderMaterial);
        this.fullScreenQuadScene = new THREE.Scene();
        this.fullScreenQuadScene.add(quadMesh);
        this.orthographicCamera = new THREE.OrthographicCamera(
            -1, 1, 1, -1, 0.1, 100);
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

    ///

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
        renderer.render(this.fullScreenQuadScene, this.orthographicCamera);
        renderer.autoClear = autoClear;
    }

}