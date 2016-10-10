module mapp.le {
    export class Util {
       
        public static canvas: fabric.ICanvas;
        public static snapThreshold: number = 20;
        public static snap: boolean = true;

        static getCanvasWidth(): number {
            return Util.canvas.getWidth();
        }

        static getCanvasHeight(): number {
            return Util.canvas.getHeight();
        }

        static getRandomColor() {
            return 'rgba(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ', 0.75)';
        }

        static setValue(value: any, ...observables: KnockoutObservable<any>[]) {
            observables.forEach(obs => {
                obs(value);
            });
        }

        static applyProperty(property: (value: any) => any, observable: KnockoutObservable<any>): any {
            property(observable());
        }

        static round(value: number) {
            return Math.round((value + 0.00001) * 100) / 100;
        }

        // Positioning functions
        static stayInCanvas(eventObject: fabric.IEvent) {
            
            let object = eventObject.target;
            let event: MouseEvent = <MouseEvent>(eventObject.e);
            
            object.setCoords();
            
            if (object.getLeft() < Util.snapThreshold) {
                object.setLeft(0);
            }

            if (object.getTop() < Util.snapThreshold) {
                object.setTop(0);
            }

            if(object.getRight() > (Util.canvas.getWidth() - Util.snapThreshold)) {
                object.setLeft(Util.canvas.getWidth() - object.getWidth());
            }

            if(object.getBottom() > (Util.canvas.getHeight() - Util.snapThreshold)) {
                object.setTop(Util.canvas.getHeight() - object.getHeight());
            }
        }

        static snapToObjects(eventObject: fabric.IEvent) {
            
            if(!Util.snap)
                return;

            let object: fabric.IObject = eventObject.target;
            
            this.canvas.forEachObject((ref: fabric.IObject) => {

                if(ref == object)
                    return;

                if(object.withinX(ref, Util.snapThreshold)) {
                    if(snapY(false))
                        snapX(true); 
                }

                if(object.withinY(ref, Util.snapThreshold)) {
                     if(snapX(false))
                        snapY(true); 
                }

                function snapX(inside: boolean): boolean {

                    if(object.snapLeft(ref, Util.snapThreshold, inside)) {
                        object.setLeft(inside ? ref.getLeft() : ref.getRight());
                        return true;    
                    }
                    else if(object.snapRight(ref, Util.snapThreshold, inside)) {
                        object.setRight(inside ? ref.getRight() : ref.getTop());
                        return true;    
                    }

                    return false;
                }
                
                function snapY(inside: boolean): boolean {
                    if(object.snapTop(ref, Util.snapThreshold, inside)) {
                        object.setTop(inside ? ref.getTop() : ref.getBottom());
                        return true;    
                    }
                    else if(object.snapBottom(ref, Util.snapThreshold, inside)) {
                        object.setBottom(inside ? ref.getBottom() : ref.getTop());
                        return true;    
                    }
                    return false;
                }

            });
        }

        static respositionObjects() {

            // this.canvas.forEachObject((object: fabric.IObject) => {

            //     if(object.width)
            // });
        }
    }
}