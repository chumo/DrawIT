DrawIT
------

This is a *tetris-like* game written in javascript (d3 web app) using a machine learning algorithm (random forest) to identify handwritten paths.

### Instructions
- The left panel presents two columns with falling objects. The object on the left will change randomly. The object on the right will be guessed by the application using your input. 
- Draw a single path on the canvas to associate that path to an object. The first rounds are used to train the application to recognise your paths as objects. 
- If you draw a path and it is guessed incorrectly, single click the canvas to loop through the objects. With every new assignment, the machine learning model used to recognise paths is retrained.
- When the objects fall to the bottom, those that are duplicated will dissapear.
- The falling speed increases with time and the game finishes when you reach 50 epochs.
- Note that your paths must be simple enough to be able to draw them quick, but sophisticated enough to not confuse the app (too similar paths will be easily confused!).

### Application
Visit [http://chumo.github.io/DrawIT](http://chumo.github.io/DrawIT) to see the app in action and play the game.

### Screen shot
![ScreenShot](images/ScreenShot.png)

### Libraries
- [d3.js](https://d3js.org)
- [randomforest.js](https://github.com/karpathy/forestjs)

### License
GNU GENERAL PUBLIC LICENSE v3.0 (see [LICENSE](LICENSE) file).

Enjoy!

Jesús Martínez-Blanco
