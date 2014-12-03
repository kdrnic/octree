OctreeNode = function (p, o)
{
	this.Split = function ()
	{
		this.children =
		[
			new OctreeNode(this, 0),
			new OctreeNode(this, 1),
			new OctreeNode(this, 2),
			new OctreeNode(this, 3),
			new OctreeNode(this, 4),
			new OctreeNode(this, 5),
			new OctreeNode(this, 6),
			new OctreeNode(this, 7)
		];
	}
	
	this.IntersectsBox = function (box)
	{
		if((Math.abs(box.center.x - this.center.x) > (this.size.x + box.size.x) * 0.5) || (Math.abs(box.center.y - this.center.y) > (this.size.y + box.size.y) * 0.5) || (Math.abs(box.center.z - this.center.z) > (this.size.z + box.size.z) * 0.5)) return false;
		return true;
	}
	
	this.faceIndices = [];
	this.children = [];
	this.size = {x: 0, y: 0, z: 0};
	this.center = {x: 0, y: 0, z: 0};
	if(p instanceof OctreeNode)
	{
		this.parent = p;
		this.octree = this.parent.octree;
		this.depth = this.parent.depth + 1;
		this.size = {x: this.parent.size.x * 0.5, y: this.parent.size.y * 0.5, z: this.parent.size.z * 0.5};
		this.center = {x: this.parent.center.x, y: this.parent.center.y, z: this.parent.center.z};
		switch(o)
		{
			case 0:
				this.center.x -= this.size.x * 0.5;
				this.center.y -= this.size.y * 0.5;
				this.center.z -= this.size.z * 0.5;
				break;
			case 1:
				this.center.x += this.size.x * 0.5;
				this.center.y -= this.size.y * 0.5;
				this.center.z -= this.size.z * 0.5;
				break;
			case 2:
				this.center.x -= this.size.x * 0.5;
				this.center.y += this.size.y * 0.5;
				this.center.z -= this.size.z * 0.5;
				break;
			case 3:
				this.center.x += this.size.x * 0.5;
				this.center.y += this.size.y * 0.5;
				this.center.z -= this.size.z * 0.5;
				break;
			case 4:
				this.center.x -= this.size.x * 0.5;
				this.center.y -= this.size.y * 0.5;
				this.center.z += this.size.z * 0.5;
				break;
			case 5:
				this.center.x += this.size.x * 0.5;
				this.center.y -= this.size.y * 0.5;
				this.center.z += this.size.z * 0.5;
				break;
			case 6:
				this.center.x -= this.size.x * 0.5;
				this.center.y += this.size.y * 0.5;
				this.center.z += this.size.z * 0.5;
				break;
			case 7:
				this.center.x += this.size.x * 0.5;
				this.center.y += this.size.y * 0.5;
				this.center.z += this.size.z * 0.5;
				break;
		}
		for(var i = 0; i < this.parent.faceIndices.length; i++)
		{
			var _f = this.parent.faceIndices[i];
			var f = this.octree.faces[_f];
			if(this.octree.TriangleBoxCollision([this.center.x, this.center.y, this.center.z], [this.size.x * 0.5, this.size.y * 0.5, this.size.z * 0.5], f)) this.faceIndices.push(_f);
		}
	}
}

function Octree(fs, maxd, minf)
{
	this.SearchBox = function (box)
	{
		var nodesToSearch = [this.root];
		var indices = [];
		var indexSet = {};
		while(nodesToSearch.length > 0)
		{
			var newNodesToSearch = [];
			for(var i = 0; i < nodesToSearch.length; i++)
			{
				var node = nodesToSearch[i];
				if(!node.IntersectsBox(box)) continue;
				if(node.children.length == 0)
				{
					for(var j = 0; j < node.faceIndices.length; j++)
					{
						if(!indexSet[node.faceIndices[j]])
						{
							indexSet[node.faceIndices[j]] = true;
							indices.push(node.faceIndices[j]);
						}
					}
				}
				else
				{
					for(var j = 0; j < node.children.length; j++) newNodesToSearch.push(node.children[j]);
				}
			}
			nodesToSearch = newNodesToSearch;
		}
		return indices;
	}
	
	this.CreateMesh = function (colour)
	{
		var obj = new THREE.Object3D();
		var nodesToMesh = [this.root];
		while(nodesToMesh.length > 0)
		{
			var newNodesToMesh = [];
			for(var i = 0; i < nodesToMesh.length; i++)
			{
				var node = nodesToMesh[i];
				if(node.children.length > 0)
				{
					for(var j = 0; j < node.children.length; j++) newNodesToMesh.push(node.children[j]);
					continue;
				}
				var cube = new THREE.BoxHelper();
				cube.material.color.copy(new THREE.Color(colour));
				cube.scale.set(node.size.x, node.size.y, node.size.z);
				cube.scale.multiplyScalar(0.5);
				cube.position.set(node.center.x, node.center.y, node.center.z);
				obj.add(cube);
			}
			nodesToMesh = newNodesToMesh;
		}
		return obj;
	}
	
	if(typeof TriangleBoxCollision != "function")
	{
		this.TriangleBoxCollision = function(bc, bhs, t)
		{
			var min = [t[0][0], t[0][1], t[0][2]];
			var max = [t[0][0], t[0][1], t[0][2]];
			for(var i = 0; i < 3; i++)
			{
				for(var j = 0; j < 0; j++)
				{
					if(min[k] > t[i][k]) min[k] = t[i][k];
					if(max[k] < t[i][k]) max[k] = t[i][k];
				}
			}
			for(var i = 0; i < 3; i++)
			{
				if(max[i] - bc[i] < -bhs[i]) return false;
				if(min[i] - bc[i] > bhs[i]) return false;
			}
			return true;
		}
	}
	else this.TriangleBoxCollision = TriangleBoxCollision;
	
	this.faces = fs;
	this.root = new OctreeNode();
	this.root.octree = this;
	this.root.depth = 1;
	var bb = {min: [this.faces[0][0][0], this.faces[0][0][1], this.faces[0][0][2]], max: [this.faces[0][0][0], this.faces[0][0][1], this.faces[0][0][2]]};
	for(var i = 0; i < this.faces.length; i++)
	{
		this.root.faceIndices.push(i);
		for(var j = 0; j < 3; j++)
		{
			for(var k = 0; k < 3; k++)
			{
				if(this.faces[i][j][k] < bb.min[k]) bb.min[k] = this.faces[i][j][k];
				if(this.faces[i][j][k] > bb.max[k]) bb.max[k] = this.faces[i][j][k];
			}
		}
	}
	this.root.center = {x: (bb.min[0] + bb.max[0]) * 0.5, y: (bb.min[1] + bb.max[1]) * 0.5, z: (bb.min[2] + bb.max[2]) * 0.5};
	this.root.size = {x: bb.max[0] - bb.min[0], y: bb.max[1] - bb.min[1], z: bb.max[2] - bb.min[2]};
	var maxDepth = 5;
	var minFaces = 10;
	if(!isNaN(maxd)) maxDepth = maxd;
	if(!isNaN(minf)) minFaces = minf;
	var nodesToSplit = [this.root];
	while(nodesToSplit.length > 0)
	{
		var newNodesToSplit = [];
		for(var i = 0; i < nodesToSplit.length; i++)
		{
			var node = nodesToSplit[i];
			if(node.faceIndices.length >= minFaces)
			{
				if(node.depth < maxDepth)
				{
					node.Split();
					for(var j = 0; j < node.children.length; j++) newNodesToSplit.push(node.children[j]);
				}
			}
		}
		nodesToSplit = newNodesToSplit;
	}
}