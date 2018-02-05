# simple-db

### Usage

Pull the repository and run "npm i" if needed

#### Commands (run from the root of the project)

##### write
```$ node write {index} {data}```

stores data at the specified index

eg: ```node write 0 "{"name":"Kristian"}"```

##### read
```$ node read {index}```

prints the data stored at the specified index

eg: ```node read 0  --->  {"name":"Kristian"}```

##### wipe
```$ node wipe```

clears the database
