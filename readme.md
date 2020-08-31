**Simple screen space blur powered outline shader for three.js**

Using separate render target and full screen pass for drawing selection 
on top of last rendered frame

---

Example https://raw.githack.com/strangerintheq/three-selection/master/example.html

---
  
Usage

    // create selection support object
    const selection = new ThreeSelection();

    // add any object3d from your scene to selection
    selection.addToSelection(object3d);

    // remove object3d from selection
    removeFromSelection(object3d);
    
    // add object if not exist in selection and remove otherwise
    toggleSelected(object3d);

    // check object in selection 
    contains(object3d);

    // clear selection
    selection.clearSelection();
    
    // render selection (must be called after your scene is rendered)
    selection.renderSelection(renderer, scene, camera);
    
---

Result:

![](https://i.imgur.com/eXIfKaf.png)
