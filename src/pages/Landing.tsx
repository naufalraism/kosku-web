import { Accordion, Anchor, Badge, Box, Button, Container, Divider, Grid, Group, Image, List, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tokenStore } from '../api';
import { rupiah } from '../format';
import { KOST, NEARBY, ROOMS, RULES, SHARED, UPGRADE_PRICE } from '../landing/data';
import type { Room } from '../landing/data';
import { prewarm } from '../warmup';

const INK = '#1b2a2e';
const RIVER = '#1f6f78';

const waLink = (message: string) => `https://wa.me/${KOST.whatsapp}?text=${encodeURIComponent(message)}`;
const external = { target: '_blank', rel: 'noopener noreferrer' } as const;

function RoomRow({ room }: { room: Room }) {
  const ready = room.status === 'ready';
  return (
    <Grid py="lg">
      <Grid.Col span={{ base: 12, sm: 4 }}>
        <Image src={`/photos/${room.id}.jpg`} fallbackSrc="/photos/placeholder.svg" alt={`Foto ${room.name}`} radius="md" h={200} fit="cover" />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 8 }}>
        <Stack gap={6}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Title order={3}>{room.name}</Title>
            <Badge color={ready ? 'green' : 'gray'} variant="light">
              {ready ? 'Ready' : 'Tanya ketersediaan'}
            </Badge>
          </Group>
          <Text fw={800} fz={24} c={RIVER}>
            {rupiah.format(room.price)} <Text span fz="sm" fw={400} c="dimmed">per bulan, belum termasuk token listrik</Text>
          </Text>
          {room.note && <Text fw={600}>{room.note}</Text>}
          {room.promo && <Text fw={600} c="orange.8">{room.promo}</Text>}
          <Text size="sm">{room.features.join(', ')}.</Text>
          <Text size="sm" c="dimmed">
            Bisa upgrade (masing-masing {UPGRADE_PRICE}): {room.upgrades.join(', ')}.
          </Text>
          <Group mt="xs">
            <Button component="a" href={waLink(`Halo, saya tertarik dengan ${room.name} di ${KOST.name}. Apakah masih tersedia?`)} {...external} color="green">
              Tanya kamar ini
            </Button>
            {room.video && (
              <Button component="a" href={room.video} {...external} variant="default">
                Lihat video di Instagram
              </Button>
            )}
          </Group>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}

export function Landing() {
  const minPrice = Math.min(...ROOMS.map((room) => room.price));

  // Someone who has signed in on this device before is most likely the owner coming back:
  // wake the server now, so it is ready by the time they press "Masuk pemilik".
  useEffect(() => {
    if (tokenStore.get()) prewarm();
  }, []);

  const warm = { onMouseEnter: prewarm, onFocus: prewarm, onTouchStart: prewarm };

  return (
    <Box c={INK} bg="#f3f6f4" mih="100vh">
      <Container size="lg" py="sm">
        <Group justify="space-between">
          <Text fw={700}>{KOST.name}</Text>
          <Anchor component={Link} to="/login" size="sm" {...warm}>
            Masuk pemilik
          </Anchor>
        </Group>
      </Container>

      <Container size="lg" py={{ base: 30, md: 60 }}>
        <Grid align="center">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <Title order={1} fz={{ base: 34, md: 52 }} lh={1.1}>
                {KOST.name}
              </Title>
              <Text fz="lg" maw={540}>
                Kost putri di {KOST.area}, dengan satpam 24 jam, wifi, dapur, dan parkir gratis.
              </Text>
              <Text fz="lg" fw={600}>
                Kamar mulai {rupiah.format(minPrice)} per bulan.
              </Text>
              <Group>
                <Button component="a" href={waLink(`Halo, saya ingin bertanya tentang kamar di ${KOST.name}.`)} {...external} size="lg" color="green">
                  Tanya lewat WhatsApp
                </Button>
                <Button component="a" href="#kamar" size="lg" variant="default">
                  Lihat pilihan kamar
                </Button>
              </Group>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Image src="/photos/utama.jpg" fallbackSrc="/photos/placeholder.svg" alt={`Tampilan ${KOST.name}`} radius="md" h={{ base: 220, md: 320 }} fit="cover" />
          </Grid.Col>
        </Grid>
      </Container>

      <Box bg={RIVER} c="white" py="md">
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
            <Text fw={600}>Khusus putri: mahasiswi dan karyawati</Text>
            <Text fw={600}>Satpam 24 jam, one gate system, dan CCTV</Text>
            <Text fw={600}>Wifi, dapur, parkir, dan IPL gratis</Text>
          </SimpleGrid>
        </Container>
      </Box>

      <Container size="lg" py={50} id="kamar">
        <Title order={2}>Pilihan kamar</Title>
        <Text mt={4} c="dimmed">Harga per bulan, belum termasuk token listrik.</Text>
        {ROOMS.map((room, index) => (
          <Box key={room.id}>
            {index > 0 && <Divider />}
            <RoomRow room={room} />
          </Box>
        ))}
      </Container>

      <Box bg="white" py={50}>
        <Container size="lg">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={40}>
            <Stack gap="xs">
              <Title order={2}>Fasilitas bersama, gratis</Title>
              <List spacing={4}>{SHARED.map((item) => <List.Item key={item}>{item}</List.Item>)}</List>
            </Stack>
            <Stack gap="xs">
              <Title order={2}>Di lingkungan kost</Title>
              <List spacing={4}>{NEARBY.map((item) => <List.Item key={item}>{item}</List.Item>)}</List>
            </Stack>
          </SimpleGrid>
        </Container>
      </Box>

      <Container size="lg" py={50}>
        <Title order={2}>Aturan penting</Title>
        <Accordion multiple mt="md" variant="separated" defaultValue={[RULES[0].title]}>
          {RULES.map((group) => (
            <Accordion.Item key={group.title} value={group.title}>
              <Accordion.Control>{group.title}</Accordion.Control>
              <Accordion.Panel>
                <List spacing="xs">{group.items.map((item) => <List.Item key={item}>{item}</List.Item>)}</List>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
        <Text size="sm" c="dimmed" mt="sm">
          Ini ringkasan, bukan pengganti surat peraturan lengkap yang dibaca dan ditandatangani saat sewa. Aturan dan harga dapat berubah.
        </Text>
      </Container>

      <Box bg="white" py={50}>
        <Container size="lg">
          <Title order={2}>Lokasi</Title>
          <Text mt={4}>{KOST.address}</Text>
          <Anchor href={KOST.mapsLink} {...external}>Buka di Google Maps</Anchor>
          <Box mt="md" h={{ base: 260, md: 380 }}>
            <iframe
              title={`Peta lokasi ${KOST.name}`}
              src={KOST.mapEmbed}
              style={{ border: 0, width: '100%', height: '100%', borderRadius: 8 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </Box>
        </Container>
      </Box>

      <Container size="lg" py={50}>
        <Title order={2}>Hubungi kami</Title>
        <Text mt={4}>Boleh tanya-tanya dulu lewat WhatsApp atau Instagram.</Text>
        <Group mt="md">
          <Button component="a" href={waLink(`Halo, saya ingin bertanya tentang kamar di ${KOST.name}.`)} {...external} color="green">
            WhatsApp {KOST.whatsappDisplay}
          </Button>
          <Button component="a" href={`https://www.instagram.com/${KOST.instagram}`} {...external} variant="default">
            Instagram @{KOST.instagram}
          </Button>
        </Group>
        <Stack gap={2} mt="md">
          <Text size="sm" c="dimmed">Kami juga ada di:</Text>
          {KOST.alsoOn.map((line) => <Text key={line} size="sm">{line}</Text>)}
        </Stack>
      </Container>

      <Box bg={INK} c="white" py="md">
        <Container size="lg">
          <Group justify="space-between">
            <Text size="sm">{KOST.name}</Text>
            <Anchor component={Link} to="/login" size="sm" c="white" {...warm}>
              Masuk pemilik
            </Anchor>
          </Group>
        </Container>
      </Box>
    </Box>
  );
}
