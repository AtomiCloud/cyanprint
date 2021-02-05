job("Test and Build") {
    startOn {
        gitPush { enabled = true }
    }

   container("node:15-alpine3.10") {
         shellScript {
            interpreter = "/bin/ash"
            content = """
                yarn
                yarn build
                yarn test --cover
            """
        }

   }


}
