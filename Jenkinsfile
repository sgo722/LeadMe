pipeline {
    agent any

    environment {
        GITLAB_REPOSITORY_URL = credentials('GITLAB_REPOSITORY_URL')
        DOCKERHUB_USERNAME = credentials('DOCKERHUB_USERNAME')
        DOCKERHUB_PASSWORD = credentials('DOCKERHUB_PASSWORD')
        DOCKERHUB_REPOSITORY = credentials('DOCKERHUB_REPOSITORY')
        EC2_INSTANCE_PRIVATE_KEY = credentials('EC2_INSTANCE_PRIVATE_KEY')
        EC2_INSTANCE_PORT = 22
        DOCKERHUB_NAME = 'leadme'
        VM_OPTION_NAME = credentials('VM_OPTION_NAME')
        VM_OPTION_PASSWORD = credentials('VM_OPTION_PASSWORD')
        MONGO_USERNAME = credentials('MONGO_USERNAME')
        MONGO_PASSWORD = credentials('MONGO_PASSWORD')
    }

    stages {
        stage('Clone Repository') {
            steps {
                script {
                    sh 'rm -rf S11P12C109'
                    echo "Cloning repository from: ${GITLAB_REPOSITORY_URL}"
                    sh "git clone ${GITLAB_REPOSITORY_URL}"
                }
            }
        }

        stage('Build Project') {
            steps {
                script {
                    dir('S11P12C109/server') {
                        sh 'chmod +x ./gradlew'
                        
                        sh './gradlew clean build -x test'
                    }
                    
                    // 클라이언트 빌드
                    //dir('S11P12C109/client') {
                    //    sh 'npm install'  
                    //    sh 'npm run build'  
                    //}
                }
            }
        }

        stage('Docker Build and Push Java Docker Image') {
            steps {
                script {
                    dir('S11P12C109/server') {
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                            sh '''
                            echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin
                            docker build -t ${DOCKERHUB_USERNAME}/${DOCKERHUB_REPOSITORY}:latest .
                            docker push ${DOCKERHUB_USERNAME}/${DOCKERHUB_REPOSITORY}:latest
                            '''
                        }
                    }
                }
            }
        }

        // stage('Build and Push Client Docker Image') {
        //    steps {
        //        script {
        //            dir('S11P12C109/client') { // 클라이언트 디렉토리 경로 변경
        //                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
        //                    sh '''
        //                    echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin
        //                    docker build -t ${DOCKERHUB_USERNAME}/client-image:latest .
        //                    docker push ${DOCKERHUB_USERNAME}/client-image:latest
        //                    '''
        //                }
        //           }
        //       }
        //    }
        //}

        stage('Build and Push Python Docker Image') {
            steps {
                script {
                    dir('S11P12C109/leadme') {
                        sh 'docker stop python-container || true'
                        sh 'docker rm python-container || true'

                        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                            sh '''
                            echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin
                            '''

                            sh '''
                            docker build -t ${DOCKERHUB_USERNAME}/python-image:latest .
                            docker push ${DOCKERHUB_USERNAME}/python-image:latest
                            '''
                        }

                        // 컨테이너 실행
                        sh '''
                            docker run -d \
                            --name python-container \
                            -p 4567:4567 \
                            -v /home/ubuntu/leadme/video/temporary:/home/ubuntu/python/video/temporary \
                            -v /home/ubuntu/leadme/video/user:/home/ubuntu/python/video/user \
                            -v /home/ubuntu/leadme/video/challenge:/home/ubuntu/python/video/challenge \
                            -v /home/ubuntu/leadme/video/challenge/audio:/home/ubuntu/python/video/challenge/audio \
                            -v /home/ubuntu/leadme/video/temporary/thumbnail:/home/ubuntu/python/video/temporary/thumbnail \
                            -v /home/ubuntu/leadme/video/user/thumbnail:/home/ubuntu/python/video/user/thumbnail \
                            ${DOCKERHUB_USERNAME}/python-image:latest
                        '''
                    }
                }
            }
        }




        stage('Deploy to EC2') {
            steps {
                script {
                    sshPublisher(
                        publishers: [
                            sshPublisherDesc(
                                configName: 'ubuntu',
                                transfers: [
                                    sshTransfer(
                                        sourceFiles: '',
                                        execCommand: """
                                        docker pull ${DOCKERHUB_USERNAME}/${DOCKERHUB_REPOSITORY}:latest
                                        docker stop ${DOCKERHUB_NAME} || true
                                        docker rm ${DOCKERHUB_NAME} || true
                                        docker run --name ${DOCKERHUB_NAME} -d -p 8090:8090 \
                                -v /home/ubuntu/leadme/video/temporary:/home/ubuntu/python/video/temporary \
                                -v /home/ubuntu/leadme/video/user:/home/ubuntu/python/video/user \
                                -v /home/ubuntu/leadme/video/challenge:/home/ubuntu/python/video/challenge \
                                -v /home/ubuntu/leadme/video/challenge/audio:/home/ubuntu/python/video/challenge/audio \
                                -v /home/ubuntu/leadme/video/temporary/thumbnail:/home/ubuntu/python/video/temporary/thumbnail \
                                -v /home/ubuntu/leadme/video/user/thumbnail:/home/ubuntu/python/video/user/thumbnail \
                                -v /home/ubuntu:/host \
                                -e JAVA_OPTS="-D${VM_OPTION_NAME}=${VM_OPTION_PASSWORD}" \
                                ${DOCKERHUB_USERNAME}/${DOCKERHUB_REPOSITORY}:latest

                                        docker pull ${DOCKERHUB_USERNAME}/client-image:latest
                                        docker stop client || true
                                        docker rm client || true
                                        docker run --name client -d -p 5173:80  ${DOCKERHUB_USERNAME}/client-image:latest

                                        docker image prune -f
                                        """,
                                        execTimeout: 120000
                                    )
                                ],
                                usePromotionTimestamp: false,
                                alwaysPublishFromMaster: false,
                                retry: 1,
                                verbose: true
                            )
                        ]
                    )
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo 'Build was successful!'
        }
        failure {
            echo 'Build failed.'
        }
    }
}
