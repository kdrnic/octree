octree
======

An octree implementation intended for faster level vs entity (box vs triangles) collision.
May or may not work correctly.
On my limited testing, improved performance greatly (allowing for two orders of magnitude more boxes).
On "test" folder is a very limited demonstration.
Code is not particularly well-written and was worked upon with large intervals inbetween.
"TriangleBoxCollision" must be defined in the global space for it to work best, you can get such a suitable function from one of my repos. Otherwise it will use its own function for this, it considers the minimum bounding box of each triangle and is very inneficient.
