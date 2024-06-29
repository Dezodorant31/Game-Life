# Game-Life
The variable cellular automaton writing in pure JS

Rules of this automaton describe with the help of regex and keep in the variables:
* radius - radius of neighborhood where the rules will work;
* cellStates - number of cell states;
* maxNeighbors - number of neighbors which will be used in the calculation of next generation;
* survivalRange - range of number neighbor cells in which cell survivals;
* birthRange - range of number neighbor cells in which cell borns;
* neighborhood - type of neighborhood(Moor or fon Neumann).

Also in the project there are various settings, such as the first generation fill area, cell sizes, edge wrapping, various templates, as well as a regular expression parser, by which you can change the rules of the game.


