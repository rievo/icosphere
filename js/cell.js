const CellType = Object.freeze({
    dirt:   { name: "dirt", color: 0x8a5f22, opacity:1.0 },
    sky:  { name: "sky", color: 0x84c5fa, opacity: 0.3  },
    water:  { name: "water", color: 0x5869ed, opacity: 0.8  },
    cloud: { name: "cloud", color: 0xfafeff, opacity: 0.6 },
    grass: { name: "grass", color: 0x2c9c46, opacity: 1.0 },
    magma: { name: "magma", color: 0xbd4d3c, opacity: 1.0 },
  });

class Cell{

    constructor(element, a_index, b_index,c_index, level){
        this.element = element;

        this.type = CellType.dirt.name; //String text
        this.a_index = a_index;
        this.b_index = b_index;
        this.c_index = c_index;
        this.level = level;

        this.changeType(this.type);
    }

    changeType(newType){
        this.type = newType;
        this.changeMaterial();
    }

    changeMaterial(){
        let newinfo = CellType[this.type]
        if(newinfo != undefined){
            this.element.material.color.setHex(newinfo.color)
            
            if(newinfo.opacity < 1.0 ){
                this.element.material.transparent = true;
            }else{
                this.element.material.transparent = false;
            }
            this.element.material.opacity = newinfo.opacity;
        }else{
            console.log("ERROR: Trying to set the material to an unknown -> " + this.type)
        }
    }
}