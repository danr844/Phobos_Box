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
    baseURL: 'http://localhost',
  });

  const handleTopicSelection = async (topic: string) => {
    setSelectedTopic(topic);
    setLoading(true);

    try {
      const response = await customAxios.post('/api/question', {
        question: `Dame un contenido de máximo 300 caracteres sobre ${topic} detallado y claro, en formato HTML`
      });
      console.log("Respuesta de la API:", response.data);
      setContent(response.data.answer);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Imprime el error completo en la consola
        console.error("Error de Axios:", error.toJSON ? error.toJSON() : error);

        // Muestra más detalles del error en la interfaz
        setContent(
          `Error: ${error.message}. ` +
          (error.response ? `Status: ${error.response.status}. Data: ${JSON.stringify(error.response.data)}` : "No response received.")
        );
      } else if (error instanceof Error) {
        console.error("Error general:", error);
        setContent(`Error: ${error.message}`);
      } else {
        setContent("Hubo un problema al cargar el contenido. Por favor, inténtalo de nuevo.");
      }
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
            <br />
          </div>
          <Group>
            {topics.map((topic) => (
              <Button key={topic} onClick={() => handleTopicSelection(topic)}>
                {topic}
              </Button>
            ))}
          </Group>
          <br />
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
