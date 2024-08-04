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

        stage('Build and Push Python Docker Image') {
            steps {
                script {
                    dir('S11P12C109/leadme') {
                        if (sh(script: 'docker ps -q -f name=python-container', returnStatus: true) == 0) {
                            sh 'docker stop python-container'
                            sh 'docker rm python-container'
                        }
                        
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                            sh '''
                            echo $DOCKERHUB_PASSWORD | docker login -u $DOCKERHUB_USERNAME --password-stdin
                            docker build -t ${DOCKERHUB_USERNAME}/python-container:latest .
                            docker push ${DOCKERHUB_USERNAME}/python-container:latest
                            '''
                        }

                        sh 'docker build -t python-app:latest .'
                        sh 'docker run -d --name python-container -p 4567:4567 python-app:latest'
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
                                        // docker run --name ${DOCKERHUB_NAME} -d -p 8090:8090 -e JAVA_OPTS="-D${VM_OPTION_NAME}=${VM_OPTION_PASSWORD}" ${DOCKERHUB_USERNAME}/${DOCKERHUB_REPOSITORY}:latest
                                        docker run --name ${DOCKERHUB_NAME} -d -p 8090:8090 -e JAVA_OPTS="-D${VM_OPTION_NAME}=${VM_OPTION_PASSWORD}" -v /home/ubuntu:/host ${DOCKERHUB_USERNAME}/${DOCKERHUB_REPOSITORY}:latest

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
