def COLOR_MAP = [
    'SUCCESS': 'good', 
    'FAILURE': 'danger',
    'UNSTABLE': 'warning',
    'ABORTED': '#808080'
]

pipeline {
    agent any

    tools {
        nodejs 'nodejs'
    }

    environment {
        APP_NAME    = "attendance-salary-app"
        NEXUS_URL   = "172.31.23.119:8081"
        NEXUS_REPO  = "payroll-repo"
        GROUP_ID    = "com.company.payroll"
        S3_BUCKET   = "attendance-salary-app-bucket"
        AWS_REGION  = "us-east-1"
    }

    stages {
        stage('Build & Package') {
            steps {
                echo 'Building and packaging application using Native Packaging Tool (npm/tar)...'
                sh 'npm run build'
            }
            post {
                success {
                    echo 'Archiving build artifacts in Jenkins...'
                    archiveArtifacts artifacts: '*.tgz'
                }
            }
        }

        stage('Unit Test') {
            steps {
                echo 'Executing Automated Unit & Salary Calculation Tests...'
                sh 'npm test'
                sh 'npx -y eslint -f json -o eslint-report.json .'
            }
        }

        stage('SonarQube Static Code Analysis') {
            environment {
                scannerHome = tool 'Sonar8.0'
            }
            steps {
                echo 'Running SonarQube Code Quality and Security Analysis...'
                withSonarQubeEnv('Sonar-server') {
                    sh '''${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=attendance-salary-app \
                        -Dsonar.projectName=attendance-salary-app \
                        -Dsonar.projectVersion=1.0 \
                        -Dsonar.sources=. \
                        -Dsonar.exclusions=node_modules/**,*.tgz \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                        -Dsonar.eslint.reportPaths=eslint-report.json'''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                echo 'Checking SonarQube Quality Gate Status...'
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Publish Artifact to Nexus') {
            steps {
                echo 'Publishing compiled artifact to Nexus Repository...'
                nexusArtifactUploader(
                    nexusVersion: 'nexus3',
                    protocol: 'http',
                    nexusUrl: "${NEXUS_URL}",
                    groupId: "${GROUP_ID}",
                    version: "1.0.${env.BUILD_ID}",
                    repository: "${NEXUS_REPO}",
                    credentialsId: 'nexuslogin',
                    artifacts: [
                        [
                            artifactId: "${APP_NAME}", 
                            classifier: '', 
                            file: "${APP_NAME}-1.0.0.tgz", 
                            type: 'tgz'
                        ]
                    ]
                )
            }
        }

        stage('Deploy to AWS S3') {
            steps {
                echo 'Fetching compiled package from Nexus Repository and deploying to AWS S3...'
                withCredentials([usernamePassword(credentialsId: 'nexuslogin', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                    withAWS(credentials: 'Jenkins_aws_login', region: "${AWS_REGION}") {
                        sh '''
                            mkdir -p deploy_tmp && cd deploy_tmp  
                            curl -u ${NEXUS_USER}:${NEXUS_PASS} -O http://${NEXUS_URL}/repository/${NEXUS_REPO}/com/company/payroll/${APP_NAME}/1.0.${env.BUILD_ID}/${APP_NAME}-1.0.${env.BUILD_ID}.tgz || \
                            curl -u ${NEXUS_USER}:${NEXUS_PASS} -O http://${NEXUS_URL}/repository/${NEXUS_REPO}/${APP_NAME}-1.0.${env.BUILD_ID}.tgz
                            tar -xzvf *.tgz
                            aws s3 sync . s3://${S3_BUCKET} --exclude '*.tgz' --delete
                            cd .. && rm -rf deploy_tmp
                        '''
                    }
                }
            }
        }
        
        stage('Clean Up') {
            steps {
                 echo 'Cleaning up generated build artifacts...'
                 sh 'rm -f *.tgz eslint-report.json || true'
            }
        }
    }

    post {
        always {
            echo 'Sending Slack build status notification...'
            slackSend channel: '#jenkins-ci',
                color: COLOR_MAP[currentBuild.currentResult] ?: 'good',
                message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER} \n More info at: ${env.BUILD_URL}"
        }
    }
}
