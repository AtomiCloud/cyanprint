job("Test and Build") {
    startOn {
        gitPush { enabled = true }
    }

    docker {
        build {
            context = "."
            file = "./Dockerfile"
            labels["platform"] = "cyanprint"
            labels["service"] = "tool"
            labels["module"] = "cli"
        }

        push("atomicloud.registry.jetbrains.space/p/cyanprint/cyanprint/dependencies") {
            tag = "\${JB_SPACE_GIT_BRANCH}-\${JB_SPACE_GIT_REVISION}"
        }
    }


    parallel {
        // test
        container("atomicloud.registry.jetbrains.space/p/cyanprint/cyanprint/dependencies:\${JB_SPACE_GIT_BRANCH}-\${JB_SPACE_GIT_REVISION}") {
             shellScript {
                content = "yarn test --cover"
            }
        }

         // build
        container("atomicloud.registry.jetbrains.space/p/cyanprint/cyanprint/dependencies:\${JB_SPACE_GIT_BRANCH}-\${JB_SPACE_GIT_REVISION}") {
             shellScript {
                content = "yarn build"
            }
        }
    }



}
