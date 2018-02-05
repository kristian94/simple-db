# simple-db

### Usage

Clone the repository and run "npm install" if needed

#### Commands (run in a terminal from the root of the project)

##### write
```> node write {index} {data}```

stores data at the specified index

eg: ```node write 0 "{"name":"Kristian"}"```

##### read
```> node read {index}```

prints the data stored at the specified index

eg: ```node read 0  --->  {"name":"Kristian"}```

##### wipe
```> node wipe```

clears the database


### Documentation

THe application creates and maintains 2 files: one that is used to hold the data stored, and another to keep track of the byte locations of the entries (by their index). The application is built with node and uses the native 'fs' package for managing file i/o. The 'database' file contains all the logic behind storing and retrieving the data.  
