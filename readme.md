simple outline shader for three.js

---

used separate render target and full screen pass for drawing selection 
on top of last rendered frame

---

example https://raw.githack.com/strangerintheq/three-selection/master/example.html

  ---
usage

    // create selection support object
    const selection = new ThreeSelection();

    // add any object3d from your scene to selection
    selection.addToSelection(object3d);

    // clear selection
    selection.clearSelection();
    
    // render selection (must be called after your scene is rendered)
    selection.renderSelection(renderer, scene, camera);
    


![](https://i.imgur.com/eXIfKaf.png)
