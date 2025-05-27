pipeline {
    agent any

    environment {
        K8S_SERVER = "https://5.189.171.241:6443"
        NAMESPACE = "default"
        DOCKER_IMAGE = 'deyvid14/hospeda_frontend'
        DOCKER_TAG = "v1.${BUILD_NUMBER}"
        DOCKER_CREDENTIALS = credentials('docker-hub')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Deyvid0104/Frontend_hospeda.git'
            }
        }

        stage('Docker Login') {
            steps {
                sh '''
                    echo $DOCKER_CREDENTIALS_PSW | docker login -u $DOCKER_CREDENTIALS_USR --password-stdin
                '''
            }
        }

        stage('Build and Push Docker Image') {
            steps {
                script {
                    // Construir imagen Docker usando el Dockerfile
                    sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} -f deploy/Dockerfile ."
                    sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                    
                    // Push de la imagen
                    sh "docker push ${DOCKER_IMAGE}:${DOCKER_TAG}"
                    sh "docker push ${DOCKER_IMAGE}:latest"
                }
            }
        }

        stage('Verificar k3s') {
            steps {
                sh 'kubectl version --client'
                sh 'kubectl get nodes'
            }
        }

        stage('Deploy en k3s') {
            steps {
                script {
                    // Actualizar la imagen en el deployment
                    sh """
                        sed -i 's|image: deyvid14/hospeda_frontend:.*|image: ${DOCKER_IMAGE}:${DOCKER_TAG}|' deploy/frontend-deployment.yaml
                    """

                    // Aplicar configuraciones
                    sh """
                        kubectl apply -f deploy/frontend-configmap.yaml
                        kubectl delete deploy hospeda-frontend || true
                        kubectl apply -f deploy/frontend-deployment.yaml
                        kubectl apply -f deploy/frontend-service.yaml
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Despliegue completado con éxito"
            echo "Nueva imagen desplegada: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            echo "Frontend accesible en: http://5.189.171.241:84"
        }
        failure {
            echo "Error en el despliegue"
            echo "Revise los logs para más detalles"
        }
        always {
            sh 'docker logout'
        }
    }
}
