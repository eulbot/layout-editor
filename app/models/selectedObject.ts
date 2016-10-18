module mapp.le {

    export class SelectedObject {

        public object: fabric.IObject;
        public id: KnockoutObservable<string>;
        private name: KnockoutObservable<string>;

        public width: DimensionData;
        public height: DimensionData;
        public top: DimensionData; 
        public right: DimensionData; 
        public bottom: DimensionData; 
        public left: DimensionData;
        
        private scaleX: KnockoutObservable<number>;
        private scaleY: KnockoutObservable<number>;

        private prioX: KnockoutObservableArray<Dimension>;
        private prioY: KnockoutObservableArray<Dimension>;
        public setPrio: (dimension: Dimension) => void;
        public getPrio: (dimension: Dimension) => Dimension;
        public hasPrio: (dimension: Dimension) => boolean;
        public isSlave: (dimension: Dimension) => boolean;
        public isLatestPrio: (dimension: Dimension) => boolean;
        public clearPrio: () => void;

        public apply: (object: fabric.IObject) => void;
        private applyChanges: (dimension: Dimension, dimensionData: IDimensionData) => void;
        public reapply: (x?: boolean) => void;

        public update: (reapply?: boolean) => void;
        public resize: () => void;
        public clear: () => void;
        private init: () => void;
        private initSelectdProperties: () => void;
        private updating: boolean;


        constructor() {            

            this.id = ko.observable<string>();
            this.name = ko.observable<string>();
            this.width = new DimensionData(Util.getCanvasWidth);
            this.height = new DimensionData(Util.getCanvasHeight);
            this.top = new DimensionData(Util.getCanvasHeight);
            this.right = new DimensionData(Util.getCanvasWidth);
            this.bottom = new DimensionData(Util.getCanvasHeight);
            this.left = new DimensionData(Util.getCanvasWidth);

            this.scaleX = ko.observable<number>();
            this.scaleY = ko.observable<number>();

            this.prioX = ko.observableArray<Dimension>();
            this.prioY = ko.observableArray<Dimension>();

            this.updating = false;
            this.apply = (object: fabric.IObject) => {

                this.object = object;
                this.initSelectdProperties();
                this.update();
            }

            this.applyChanges = (dimension: Dimension, dimensionData: IDimensionData) => {
                
                if(this.object && !this.updating) {
                    
                    this.object.setData(Dimension[dimension], dimensionData);

                    if (Util.isHorizontal(dimension)) 
                        this.object.set('scaleX', 1);
                    if (!Util.isHorizontal(dimension)) 
                        this.object.set('scaleY', 1);

                    var oldValue = this.getOldValue(this.object, dimension);

                    if(!isNaN(dimensionData.value) && dimensionData.value !== oldValue) {

                        let value = dimensionData.value;

                        if(dimension == Dimension.Width) {
                            this.applyWidth(dimensionData);
                        }
                        else if(dimension == Dimension.Height) {
                            this.applyHeight(dimensionData);
                        }
                        else if(dimension == Dimension.Top) {
                            this.applyTop(dimensionData);
                        }
                        else if(dimension == Dimension.Right) {
                            this.applyRight(dimensionData);
                        }
                        else if(dimension == Dimension.Bottom) {
                            this.applyBottom(dimensionData);
                        }
                        else if(dimension == Dimension.Left) {
                            this.applyLeft(dimensionData);
                        }

                        
                        this.object.setCoords();
                        Util.canvas.renderAll();
                    }
                }
            }

            this.reapply = (x?: boolean) => {

                this.updating = true;

                if (x == undefined || x === true) {
                    this.object.set('scaleX', 1);
                    this.object.setLeft(this.left.value());
                    this.object.setWidth(this.width.value());
                }

                if (x == undefined || x === false) {
                    this.object.set('scaleY', 1);
                    this.object.setTop(this.top.value());
                    this.object.setHeight(this.height.value());
                }

                this.updating = false;
            }
            
            this.update = (reapply?: boolean) => {

                this.updating = true;

                if(this.width.value() !== this.object.getWidth()) {
                    this.width.value(this.object.getWidth());
                }
                if(this.height.value() !== this.object.getHeight()) {
                    this.height.value(this.object.getHeight());
                }
                if(this.top.value() !== this.object.getTop()) {
                    this.top.value(this.object.getTop());
                }
                if(this.left.value() !== this.object.getLeft()) {
                    this.left.value(this.object.getLeft());
                }

                let difRight = Util.canvas.getWidth() - this.object.getLeft() - this.object.getWidth();
                if(this.right.value() !== difRight) {
                    this.right.value(difRight);
                    this.object.setData(Dimension[Dimension.Right], this.right.getData());
                }
                
                let difBottom = Util.canvas.getHeight() - this.object.getTop() - this.object.getHeight()
                if(this.bottom.value() !== difBottom) {
                    this.bottom.value(difBottom);
                    this.object.setData(Dimension[Dimension.Bottom], this.bottom.getData());
                }

                this.updating = false;
            }
            
            this.setPrio = (dimension: Dimension) => {
                if(Util.isHorizontal(dimension) && this.prioX()[0] != dimension)
                    this.prioX.unshift(dimension);
                else if(!(Util.isHorizontal(dimension)) && this.prioY()[0] != dimension)
                    this.prioY.unshift(dimension);

                if(this.prioX().length > 2) 
                    this.prioX(this.prioX().slice(0, 2));

                if(this.prioY().length > 2) 
                    this.prioY(this.prioY().slice(0, 2));
                    
                this.object.data['prioX'] = this.prioX().slice();
                this.object.data['prioY'] = this.prioY().slice();
            }

            this.getPrio = (dimension: Dimension) => {

                if(Util.isHorizontal(dimension)) {
                    if(this.prioX()[0] != dimension) return this.prioX()[0];
                    else if(this.prioX()[1] != dimension) return this.prioX()[1];
                }
                else if (!(Util.isHorizontal(dimension))) {
                    if(this.prioY()[0] != dimension) return this.prioY()[0];
                    else if(this.prioY()[1] != dimension) return this.prioY()[1];
                }
                
                return 0;
            }

            this.isLatestPrio = (dimension: Dimension) => {
                
                if(Util.isHorizontal(dimension))
                    return this.prioX()[0] == dimension;
                else
                    return this.prioY()[0] == dimension;
            }

            this.hasPrio = (dimension: Dimension) => {

                if(Util.isHorizontal(dimension) && $.inArray(dimension, this.prioX()) >= 0)
                    return true;
                if(!(Util.isHorizontal(dimension)) && $.inArray(dimension, this.prioY()) >= 0)
                    return true;

                return false;
            }

            this.isSlave = (dimension: Dimension) => {

                if(Util.isHorizontal(dimension) && this.prioX().length == 2 && $.inArray(dimension, this.prioX()) < 0)
                    return true;
                if(!(Util.isHorizontal(dimension)) && this.prioY().length == 2 && $.inArray(dimension, this.prioY()) < 0)
                    return true;

                return false;
            }

            this.clearPrio = () => {
                this.prioX.removeAll();
                this.prioY.removeAll();
            }

            this.clear = () => {

                this.updating = true;
                Util.setValue(undefined, this.id, this.name, this.width.value, this.height.value, this.top.value, this.right.value, this.bottom.value, this.left.value);
                Util.setValue(false, this.width.showRelative, this.width.isAbsolute, this.height.showRelative, this.height.isAbsolute, 
                    this.top.showRelative, this.top.isAbsolute, this.right.showRelative, this.right.isAbsolute, 
                    this.bottom.showRelative, this.bottom.isAbsolute, this.left.showRelative, this.left.isAbsolute);
                this.updating = false;

                this.prioX.removeAll();
                this.prioY.removeAll();
            }

            this.initSelectdProperties = () => {
                
                this.clear();
                this.id(this.object.getId());
                this.width.setData(this.object.data[Dimension[Dimension.Width]]);
                this.height.setData(this.object.data[Dimension[Dimension.Height]]);
                this.top.setData(this.object.data[Dimension[Dimension.Top]]);
                this.right.setData(this.object.data[Dimension[Dimension.Right]]);
                this.bottom.setData(this.object.data[Dimension[Dimension.Bottom]]);
                this.left.setData(this.object.data[Dimension[Dimension.Left]]);

                this.prioX.push.apply(this.prioX, this.object.data['prioX']);
                this.prioY.push.apply(this.prioY, this.object.data['prioY']);
            }

            this.init = () => {

                this.width.getData.subscribe((data) => { this.applyChanges(Dimension.Width, data); });
                this.height.getData.subscribe((data) => { this.applyChanges(Dimension.Height, data); });
                this.top.getData.subscribe((data) => { this.applyChanges(Dimension.Top, data); });
                this.right.getData.subscribe((data) => { this.applyChanges(Dimension.Right, data); });
                this.bottom.getData.subscribe((data) => { this.applyChanges(Dimension.Bottom, data);});
                this.left.getData.subscribe((data) => { this.applyChanges(Dimension.Left, data);});
            }
            
            this.init();
        }

        private getOldValue(object: fabric.IObject, dimension: Dimension) {

            switch(dimension) {
                case Dimension.Width:
                    return Math.round(object.getWidth());
                case Dimension.Height:
                    return Math.round(object.getHeight());
                case Dimension.Top:
                    return Math.round(object.getTop());
                case Dimension.Right:
                    return Math.round(object.getRight());
                case Dimension.Bottom:
                    return Math.round(object.getBottom());
                case Dimension.Left:
                    return Math.round(object.getLeft());
            }
        }

        private applyWidth(dimensionData: IDimensionData) {
            console.info('-- WIDTH --');
            let oldValue = this.object.getWidth();
            console.log("Width applied: ", oldValue + ' -- > ' + dimensionData.value);
            this.object.setWidth(dimensionData.value);
            this.setPrio(Dimension.Width);

            if(this.getPrio(Dimension.Width) == Dimension.Right) {
                oldValue = this.object.getLeft();
                let value = Util.canvas.getWidth() - this.width.value() - this.right.value();
                console.log("Object docked right, left applied: ", oldValue + ' -- > ' + value);
                this.object.setLeft(value);
            }
        }

        private applyHeight(dimensionData: IDimensionData) {
            console.info('-- HEIGHT --');
            let oldValue = this.object.getHeight();
            console.log("Height applied: ", oldValue + ' -- > ' + dimensionData.value);
            this.object.setHeight(dimensionData.value);
            this.setPrio(Dimension.Height);

            if(this.getPrio(Dimension.Height) == Dimension.Bottom) {
                oldValue = this.object.getTop();
                let value = (Util.canvas.getHeight() - this.height.value() - this.bottom.value());
                console.log("Object docked bottom, top applied: ", oldValue + ' -- > ' + value);
                this.object.setTop(value);
            }
        }

        private applyTop(dimensionData: IDimensionData) {
            console.info('-- TOP --');
            let oldValue = this.object.getTop();
            console.log("Top applied: ", oldValue + ' -- > ' + dimensionData.value);
            this.object.setTop(dimensionData.value);
            this.setPrio(Dimension.Top);

            if(this.getPrio(Dimension.Top) == Dimension.Bottom) {
                oldValue = this.object.getHeight();
                let value = Util.canvas.getHeight() - this.top.value() - this.bottom.value();
                console.log("Object docked bottom, height applied: ", oldValue + ' -- > ' + value);
                this.object.setHeight(value);
            }
        }

        private applyRight(dimensionData: IDimensionData) {
            console.info('-- RIGHT --');
            this.object.data['Right'] || (this.object.data['Right'] = {});
            this.object.data['Right']['value'] = dimensionData.value;
            this.setPrio(Dimension.Right);
            
            if(this.getPrio(Dimension.Right) == Dimension.Left) {
                let oldValue = this.object.getWidth();
                let value = Util.canvas.getWidth() - dimensionData.value - this.left.value();
                console.log("Object docked left, width applied: ", oldValue + ' -- > ' + value);
                this.object.setWidth(value);
            }
            else {
                let oldValue = this.object.getLeft();
                let value = Util.getCanvasWidth() - dimensionData.value - this.object.getWidth();
                this.left.value(value);
                console.log("Object width set, left applied: ", oldValue + ' -- > ' + value);
                this.object.setLeft(value);
            }
        }

        private applyBottom(dimensionData: IDimensionData){
            console.info('-- BOTTOM --');
            this.object.data['Bottom'] || (this.object.data['Bottom'] = {});
            this.object.data['Bottom']['value'] = dimensionData.value;
            this.setPrio(Dimension.Bottom);
            
            if(this.getPrio(Dimension.Bottom) == Dimension.Top) {
                let oldValue = this.object.getHeight();
                let value = Util.canvas.getHeight() - dimensionData.value - this.top.value();
                console.log("Object docked top, height applied: ", oldValue + ' -- > ' + value);
                this.object.setHeight(value);
            }
            else {
                let oldValue = this.object.getTop();
                let value = Util.getCanvasHeight() - dimensionData.value - this.object.getHeight();
                this.top.value(value);
                console.log("Object top set, top applied: ", oldValue + ' -- > ' + value);
                this.object.setTop(value);
            }
        }

        private applyLeft(dimensionData: IDimensionData) {
            console.info('-- LEFT --');
            let oldValue = this.object.getLeft();
            console.log("Left applied: ", oldValue + ' -- > ' + dimensionData.value);
            this.object.setLeft(dimensionData.value);
            this.setPrio(Dimension.Left);

            if(this.getPrio(Dimension.Left) == Dimension.Right) {
                oldValue = this.object.getWidth();
                let value = Util.canvas.getWidth() - this.left.value() - this.right.value();
                console.log("Object docked right, width applied: ", oldValue + ' -- > ' + value);
                this.object.setWidth(value);
            }
        }
    }
}