app.controller('FilebrowserCtrl', ['Sketch','$http',function(Sketch,$http){
        this.sketches = [];
        var self = this;
        $http.get('/sketchtree').then(function(res) {
            self.sketches = res.data;
        });
        this.loadFile = function(file) {
            Sketch.loadSketch(file);
        }

        this.toggleNode = function(node) {
            node.closed = !node.closed;
        }
        this.isClosed = function(node) {
            if(node.closed == undefined) {
                node.closed = false;
            }
            return {
                'tree-node-closed':node.closed,
                'tree-node-opened':!node.closed
            }
        }
    }]);