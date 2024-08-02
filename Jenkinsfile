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

        stage('Build and Push Python Docker Image') {
            steps {
                script {
                    // dir('S11P12C109/leadme') {
                    //     sh 'docker stop python-container || true'
                    //     sh 'docker rm -f python-container || true'
                        
                    //     withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                    //         sh '''
                    //         docker login -u $DOCKERHUB_USERNAME -p $DOCKERHUB_PASSWORD
                    //         docker build -t ${DOCKERHUB_USERNAME}/${PYTHON_DOCKERHUB_REPOSITORY} .
                    //         docker push ${DOCKERHUB_USERNAME}/${PYTHON_DOCKERHUB_REPOSITORY}:latest
                    //         '''
                    //     }
                    // }

                    dir('S11P12C109/leadme') {
                        sh 'docker stop python-container || true'
                        sh 'docker rm -f python-container || true'
                        sh 'docker build -t python-app:latest .'
                        sh 'docker run -d --name python-container -p 4567:4567 python-app:latest'
                    }

                }
            }
        }

        stage('Docker Build and Push Java Docker Image') {
            steps {
                script {
                    // Docker build and push
                    dir('S11P12C109/server'){
                    withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD')]) {
                        sh '''
                        docker login -u $DOCKERHUB_USERNAME -p $DOCKERHUB_PASSWORD
                        '''
                    }
                        sh "docker build -t ${DOCKERHUB_USERNAME}/${DOCKERHUB_REPOSITORY} ."
                        sh "docker push ${DOCKERHUB_USERNAME}/${DOCKERHUB_REPOSITORY}:latest"
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
