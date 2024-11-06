import React, { useState } from 'react';
import axios from 'axios';
import { Stack, Center, Title, Group, Button } from '@mantine/core';
import WithNavBar from '@Components/WithNavbar';

const topics = ["Pentesting", "Computacion Forense", "Ciberseguridad", "Ingeniería Social", "Análisis de Malware"];

const Education: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const customAxios = axios.create({
    baseURL: 'http://127.0.0.1:5000',
  });

  const handleTopicSelection = async (topic: string) => {
    setSelectedTopic(topic);
    setLoading(true);

    try {
      const response = await customAxios.post('/api/question', {
        question: `Dame un contenido de máximo 300 caracteres sobre ${topic} detallado y claro, en formato HTML`
      });
      setContent(response.data.answer);
    } catch (error) {
      console.error("Error al obtener el contenido:", error);
      setContent("Hubo un problema al cargar el contenido. Por favor, inténtalo de nuevo." + String(error.stack));
    } finally {
      setLoading(false);
    }
  };

  return (
    <WithNavBar>
      <Stack justify="space-between" h="calc(100vh - 16px)">
        <div>
          <div>
            <Title order={1}>Selecciona un tema de aprendizaje</Title>
            <br></br>
          </div>
          <Group>
            {topics.map((topic) => (
              <Button key={topic} onClick={() => handleTopicSelection(topic)}>
                {topic}
              </Button>
            ))}
          </Group>
          <br></br>
          {selectedTopic && (
            <div>
              <Title order={2}>{selectedTopic}</Title>
              {loading ? (
                <p>Cargando contenido...</p>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              )}
            </div>
          )}
        </div>
        <Center h="calc(100vh - 16px)">
          <Title order={2}>Uniandes CTF</Title>
          <p>_Se logra pasar tesis?</p>
        </Center>
      </Stack>
    </WithNavBar>
  );
};

export default Education;
