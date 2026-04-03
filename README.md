# Pacman
Nothing more fun than playing the classic game of Pac-man! Play a round of pacman! Beat the ghosts by collecting all the food before they get to you! You have 3 lives to accomplish this goal! Use the arrow keys to navigate around the map and eat all the food.  With more food that is consumed, it will give you a higher score! Go through the tunnels to escape the ghosts when needed, and use the powerups to gain extra points! 

Why I made this: 
I built this program as fun way to make a web-game that people could play as well as being able to recreate the iconic arcade experiences from scratch. Building this program helped me with detecting collision, sprite movement such as the ghosts and animation to make the navigation throughout the game more smoother. I was also able to think through the process for lives, scores, changing the ghosts to "frightened mode", and resetting positions. Thinking and planning this game was simple in my head, but a lot more complicated as the process involved heavy debugging by trying to find exactly why a ghost would disappear when they ran into a wall or the pacman not having the right direction. 

What I struggled with: 
I would say the #1 thing that I struggled with the most was being able to understand the buffering logic and movement because most of the time, it worked but the animations were not that smooth like a typical game and I wanted to make a similar replica to the classic with my adjustments. Sometimes when the pacman moved, the pellets(food) wasn't able to be detected and it would trigger the wrong step such as causing the pacman to disappear and pause the game. Sometimes when the ghosts were stuck in walls and being able to use the "tunnels", they wouldn't move around, and I would then trace back to the loop where the locations were randomized so that the ghosts could try to catch the pacman instead. 

What I learned:
I learned how to create a complete game loop in JavaScript, handling real-time movement, collision detection, and drawing/rendering. I gained experience debugging tricky issues such as buffered turning, disappearing sprites, and state resets. I also learned the importance of file structuring and naming conventions when hosting a project on the web. The overall outcome from this project was learning about the many small systems that have to work together to make even a simple game feel smooth and playable. 

Main things that were improved after I built this program: 
- problem-solving
- debugging skills
- understanding animation in Javascript
- implementing accurate collision detection for pellets, walls, ghosts, and power-ups
